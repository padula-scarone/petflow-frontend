import { useRef, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { useUsuarioSesion } from '@/features/auth/hooks/use-usuario-sesion'
import { anularDevolucionApi } from '@/features/ventas/devoluciones/api/anular-devolucion-api'
import { consultarDevolucionApi } from '@/features/ventas/devoluciones/api/consultar-devolucion-api'
import { convertirDetalleApiAVentaVinculada } from '@/features/ventas/devoluciones/api/convertir-detalle-api-a-venta-vinculada'
import {
  crearMensajeDevolucionYaAnulada,
  MENSAJE_ANULACION_DEVOLUCION_INCIERTA,
  MENSAJE_ANULACION_DEVOLUCION_NO_APLICADA,
  MENSAJE_DEVOLUCION_INEXISTENTE,
  MENSAJE_DETALLE_DEVOLUCION_ILEGIBLE,
  MENSAJE_EDICION_DEVOLUCION_NO_PREPARADA,
  MENSAJE_PLAZO_VENCIDO_DEVOLUCION,
} from '@/features/ventas/devoluciones/config/mensajes-error-devolucion'
import { esVentaVinculable } from '@/features/ventas/devoluciones/config/reglas-devoluciones'
import {
  ETIQUETA_POR_MOTIVO_DEVOLUCION,
} from '@/features/ventas/devoluciones/config/motivos-devolucion'
import type {
  AccionDevolucion,
  AltaRepoblada,
  AvisoDevoluciones,
  ConfirmacionAccionDevolucion,
  ErrorAccionDevolucion,
  FilaDevolucion,
} from '@/features/ventas/devoluciones/types/devolucion'
import {
  construirAltaRepoblada,
  type VentaParaRepoblar,
} from '@/features/ventas/devoluciones/utils/construir-alta-repoblada'
import { convertirProductoACatalogoDevolucion } from '@/features/ventas/devoluciones/utils/catalogo-devoluciones'
import {
  crearErrorAccionDevolucion,
  leerCodigoErrorDevolucion,
  traducirRechazoAnulacionDevolucion,
} from '@/features/ventas/devoluciones/utils/traducir-error-devolucion'
import { verificarAnulacionDevolucionAplicada } from '@/features/ventas/devoluciones/utils/verificar-resultado-devolucion'
import { consultarProductosApi } from '@/features/ventas/api/consultar-productos-api'
import { consultarVentaApi } from '@/features/ventas/api/consultar-venta-api'
import { CODIGO_MOTIVO_OTRO } from '@/features/ventas/config/motivos-venta'
import type { MedioPago } from '@/features/ventas/types/cobro'
import { construirTextoMotivoConEtiquetas } from '@/features/ventas/utils/construir-texto-motivo'
import { esMotivoValido } from '@/features/ventas/utils/motivos-venta'
import { clasificarFalloAccion } from '@/features/ventas/utils/traducir-error-accion-venta'

/** Confirmacion abierta tal como se guarda: "motivoValido" se calcula al exponerla. */
type EstadoConfirmacion = Omit<ConfirmacionAccionDevolucion, 'motivoValido'>

/** Como termino el intento de anular. */
type ResultadoAnulacion =
  | { tipo: 'aplicada'; huboSaldo: boolean }
  /** 401: el cliente HTTP ya cerro la sesion. */
  | { tipo: 'sin-sesion' }
  /** `devolucionModificada` indica que el servidor mostro un estado distinto al de la pantalla: hay que volver a pedir los datos. */
  | { tipo: 'error'; error: ErrorAccionDevolucion; devolucionModificada: boolean }

/** Como termino la preparacion de la edicion (juntar todo antes de anular). */
type ResultadoPreparacion =
  | { tipo: 'listo'; alta: AltaRepoblada }
  | { tipo: 'sin-sesion' }
  | { tipo: 'error'; error: ErrorAccionDevolucion; devolucionModificada: boolean }

/** Lo que necesita el hook que anula y edita devoluciones. */
interface OpcionesModificarDevolucion {
  /** Busca la fila en el detalle abierto o, si no esta, en la lista. */
  buscarFila: (idDevolucion: number) => FilaDevolucion | undefined
  /** Para cruzar el tipo del medio de pago al repoblar la edicion. */
  medios: MedioPago[]
  /** Hora del servidor menos hora local, para estimar cuando salio un pedido. */
  desfaseServidorMilisegundos: number
  /** El servidor cambio la devolución (o la lista quedo vieja): hay que volver a pedir lista y detalle. */
  alCambiarDevolucion: () => void
  /** Editar anulo la devolución: se reabre el alta con sus datos. */
  alReabrirAlta: (alta: AltaRepoblada) => void
}

const SIN_REFERENCIA = { estadoHttp: null, codigo: null } as const

/**
 * Editar y Anular una devolución: confirmacion con motivo, pedido al back y su resultado. Editar es anular y volver a
 * cargar con el alta (no hay endpoint de edicion): junta ANTES de anular todo lo necesario para repoblar (el
 * devolución, la venta vinculada y el catalogo), asi un GET que falla no deja una devolución anulada sin repoblar.
 * Si el resultado de la anulacion es incierto, consulta el detalle para saber que paso; reintentar es seguro
 * porque el back responde 409 a una segunda anulacion y ese 409 tambien se verifica.
 */
export function useModificarDevolucion({
  buscarFila,
  medios,
  desfaseServidorMilisegundos,
  alCambiarDevolucion,
  alReabrirAlta,
}: OpcionesModificarDevolucion) {
  const { cliente } = useSesion()
  const usuario = useUsuarioSesion()

  // --- ESTADOS ---
  const [confirmacion, setConfirmacion] = useState<EstadoConfirmacion | null>(null)
  const [aviso, setAviso] = useState<AvisoDevoluciones | null>(null)
  // Un ref y no un estado: un segundo toque puede llegar antes del siguiente render
  const envioBloqueadoRef = useRef(false)

  // --- PEDIDOS ---
  const prepararEdicion = async (idDevolucion: number): Promise<ResultadoPreparacion> => {
    const falloNoPreparado = (error?: ErrorAccionDevolucion, devolucionModificada = false): ResultadoPreparacion => ({
      tipo: 'error',
      error: error ?? crearErrorAccionDevolucion(SIN_REFERENCIA, MENSAJE_EDICION_DEVOLUCION_NO_PREPARADA),
      devolucionModificada,
    })

    const [respuestaDevolucion, respuestaCatalogo] = await Promise.all([
      consultarDevolucionApi(cliente, idDevolucion),
      consultarProductosApi(cliente),
    ])
    for (const respuesta of [respuestaDevolucion, respuestaCatalogo]) {
      if (!respuesta.exitoso && clasificarFalloAccion(respuesta.error) === 'sin-sesion') {
        return { tipo: 'sin-sesion' }
      }
    }
    if (!respuestaDevolucion.exitoso) {
      return respuestaDevolucion.error.estado === 404
        ? falloNoPreparado(
            crearErrorAccionDevolucion({ estadoHttp: 404, codigo: 'CAMBIO_NO_ENCONTRADO' }, MENSAJE_DEVOLUCION_INEXISTENTE, {
              reintentable: false,
            }),
            true,
          )
        : falloNoPreparado()
    }
    if (!respuestaCatalogo.exitoso) return falloNoPreparado()

    const { devolucion, desfaseServidorMilisegundos: desfaseDelDetalle } = respuestaDevolucion.datos
    // Con el detalle fresco ya se sabe si el back lo va a rechazar: no se anula ni se intenta
    if (devolucion.estado === 'ANULADO') {
      const nombre = devolucion.anulacion?.nombreUsuario ?? null
      return falloNoPreparado(
        crearErrorAccionDevolucion(
          { estadoHttp: 409, codigo: 'CAMBIO_YA_ANULADO' },
          crearMensajeDevolucionYaAnulada(nombre),
          { reintentable: false },
        ),
        true,
      )
    }
    const limite = devolucion.fechaHoraLimiteModificacion
    if (limite !== null && Date.parse(limite) <= Date.now() + desfaseDelDetalle) {
      return falloNoPreparado(
        crearErrorAccionDevolucion({ estadoHttp: 403, codigo: 'PLAZO_VENCIDO' }, MENSAJE_PLAZO_VENCIDO_DEVOLUCION, {
          reintentable: false,
        }),
        true,
      )
    }
    // Sin los medios cargados no se puede cruzar el tipo del medio del cobro
    if (devolucion.pagoSaldo !== null && medios.length === 0) return falloNoPreparado()

    // --- VENTA VINCULADA ---
    let venta: VentaParaRepoblar = { tipo: 'sin-venta' }
    if (devolucion.ventaVinculada !== null) {
      const respuestaVenta = await consultarVentaApi(cliente, String(devolucion.ventaVinculada.idVenta))
      if (!respuestaVenta.exitoso) {
        if (clasificarFalloAccion(respuestaVenta.error) === 'sin-sesion') return { tipo: 'sin-sesion' }
        // Un 404 es firme (la venta no esta); cualquier otro fallo impide juntar lo necesario: no se anula nada
        if (respuestaVenta.error.estado !== 404) return falloNoPreparado()
        venta = { tipo: 'no-disponible' }
      } else {
        const vinculada = convertirDetalleApiAVentaVinculada(respuestaVenta.datos.venta, medios, respuestaCatalogo.datos)
        if (vinculada === null) {
          return falloNoPreparado(
            crearErrorAccionDevolucion(SIN_REFERENCIA, MENSAJE_DETALLE_DEVOLUCION_ILEGIBLE),
          )
        }
        venta = esVentaVinculable(vinculada.estado) ? { tipo: 'vinculada', venta: vinculada } : { tipo: 'no-vinculable' }
      }
    }

    return {
      tipo: 'listo',
      alta: construirAltaRepoblada({
        devolucion,
        venta,
        catalogo: respuestaCatalogo.datos.map(convertirProductoACatalogoDevolucion),
        medios,
      }),
    }
  }

  /** Despues de un 409 o de un resultado incierto: el detalle dice si la anulacion se aplico. */
  const verificarAnulacion = async (
    idDevolucion: number,
    motivo: string,
    enviadoEnMilisegundos: number,
    fueIncierto: boolean,
    errorOriginal: ErrorAccionDevolucion,
  ): Promise<ResultadoAnulacion> => {
    const respuesta = await consultarDevolucionApi(cliente, idDevolucion)
    if (!respuesta.exitoso) {
      // Sin poder confirmar el estado no se afirma nada: se avisa que se puede reintentar sin riesgo
      return {
        tipo: 'error',
        error: crearErrorAccionDevolucion(SIN_REFERENCIA, MENSAJE_ANULACION_DEVOLUCION_INCIERTA, { incierto: true }),
        devolucionModificada: false,
      }
    }
    const ahoraServidor = Date.now() + respuesta.datos.desfaseServidorMilisegundos
    const verificacion = verificarAnulacionDevolucionAplicada(
      respuesta.datos.devolucion,
      { motivo, idUsuario: usuario.idUsuario, enviadoEnMilisegundos },
      ahoraServidor,
    )
    if (verificacion.tipo === 'aplicada') return { tipo: 'aplicada', huboSaldo: verificacion.huboSaldo }
    if (verificacion.tipo === 'anulada-por-otro') {
      return {
        tipo: 'error',
        error: crearErrorAccionDevolucion(
          { estadoHttp: 409, codigo: 'CAMBIO_YA_ANULADO' },
          crearMensajeDevolucionYaAnulada(verificacion.nombreUsuario),
          { reintentable: false },
        ),
        devolucionModificada: true,
      }
    }
    if (verificacion.ventanaVencida) {
      return {
        tipo: 'error',
        error: crearErrorAccionDevolucion({ estadoHttp: 403, codigo: 'PLAZO_VENCIDO' }, MENSAJE_PLAZO_VENCIDO_DEVOLUCION, {
          reintentable: false,
        }),
        devolucionModificada: true,
      }
    }
    // Sigue sin anular y dentro de plazo: tras un resultado incierto, no se aplico; un 409 firme es el que se mostro
    return {
      tipo: 'error',
      error: fueIncierto
        ? crearErrorAccionDevolucion(SIN_REFERENCIA, MENSAJE_ANULACION_DEVOLUCION_NO_APLICADA)
        : errorOriginal,
      devolucionModificada: false,
    }
  }

  const anularDevolucion = async (idDevolucion: number, motivo: string): Promise<ResultadoAnulacion> => {
    const enviadoEnMilisegundos = Date.now() + desfaseServidorMilisegundos
    const respuesta = await anularDevolucionApi(cliente, idDevolucion, motivo)
    if (respuesta.exitoso) {
      return { tipo: 'aplicada', huboSaldo: respuesta.datos.devolucion.saldoResultante > 0 }
    }

    const clasificacion = clasificarFalloAccion(respuesta.error)
    if (clasificacion === 'sin-sesion') return { tipo: 'sin-sesion' }
    const errorTraducido = traducirRechazoAnulacionDevolucion(respuesta.error)

    // Un 409 CAMBIO_YA_ANULADO puede ser la repeticion de una anulacion que si se guardo: se verifica.
    // Los demas rechazos (400, 403, 404 y los 409 de caja o stock) son firmes: nada se anulo.
    const codigo = leerCodigoErrorDevolucion(respuesta.error)
    const requiereVerificar =
      clasificacion === 'incierto' ||
      (respuesta.error.estado === 409 && (codigo === 'CAMBIO_YA_ANULADO' || codigo === null))
    if (!requiereVerificar) {
      return { tipo: 'error', error: errorTraducido, devolucionModificada: respuesta.error.estado === 403 || respuesta.error.estado === 404 }
    }
    return verificarAnulacion(idDevolucion, motivo, enviadoEnMilisegundos, clasificacion === 'incierto', errorTraducido)
  }

  // --- ACCIONES ---
  const solicitarAccion = (accion: AccionDevolucion, idDevolucion: number) => {
    const fila = buscarFila(idDevolucion)
    // Sin motivo elegido: no hay opcion preseleccionada
    if (fila) {
      setConfirmacion({ accion, fila, enviando: false, error: null, codigoMotivo: null, detalleMotivo: '' })
    }
  }

  const seleccionarMotivo = (codigoMotivo: string) =>
    setConfirmacion((actual) =>
      // El detalle solo existe con "Otro": al elegir otro motivo se descarta lo escrito
      actual && {
        ...actual,
        codigoMotivo,
        detalleMotivo: codigoMotivo === CODIGO_MOTIVO_OTRO ? actual.detalleMotivo : '',
      },
    )

  const cambiarDetalleMotivo = (detalleMotivo: string) =>
    setConfirmacion((actual) => actual && { ...actual, detalleMotivo })

  const confirmarAccion = async () => {
    if (confirmacion === null || envioBloqueadoRef.current) return
    // El front no deja confirmar sin motivo; el servidor tambien lo validaria (400)
    if (!esMotivoValido(confirmacion.codigoMotivo, confirmacion.detalleMotivo)) return
    const enCurso = confirmacion
    const idDevolucion = enCurso.fila.idDevolucion
    envioBloqueadoRef.current = true
    setConfirmacion({ ...enCurso, enviando: true, error: null })

    try {
      // Anular y Editar mandan el mismo texto: el back no distingue una accion de la otra
      const motivo = construirTextoMotivoConEtiquetas(
        enCurso.codigoMotivo as string,
        enCurso.detalleMotivo,
        ETIQUETA_POR_MOTIVO_DEVOLUCION,
      )

      // Editar: todo lo necesario para repoblar se junta antes de anular
      let alta: AltaRepoblada | null = null
      if (enCurso.accion === 'EDITAR') {
        const preparacion = await prepararEdicion(idDevolucion)
        if (preparacion.tipo === 'sin-sesion') {
          setConfirmacion({ ...enCurso, enviando: false })
          return
        }
        if (preparacion.tipo === 'error') {
          setConfirmacion({ ...enCurso, enviando: false, error: preparacion.error })
          if (preparacion.devolucionModificada) alCambiarDevolucion()
          return
        }
        alta = preparacion.alta
      }

      const resultado = await anularDevolucion(idDevolucion, motivo)
      if (resultado.tipo === 'sin-sesion') {
        setConfirmacion({ ...enCurso, enviando: false })
        return
      }
      if (resultado.tipo === 'error') {
        setConfirmacion({ ...enCurso, enviando: false, error: resultado.error })
        if (resultado.devolucionModificada) alCambiarDevolucion()
        return
      }

      // Aplicada: la verdad la tiene el servidor, se vuelve a pedir lista y detalle
      setConfirmacion(null)
      alCambiarDevolucion()
      if (alta !== null) {
        alReabrirAlta(alta)
        return
      }
      setAviso({
        mensaje: `Devolución ${idDevolucion} anulada. Se repuso el stock${
          resultado.huboSaldo ? ' y se revirtió el saldo cobrado' : ''
        }.`,
      })
    } finally {
      envioBloqueadoRef.current = false
    }
  }

  return {
    confirmacion:
      confirmacion && {
        ...confirmacion,
        motivoValido: esMotivoValido(confirmacion.codigoMotivo, confirmacion.detalleMotivo),
      },
    aviso,
    mostrarAviso: setAviso,
    solicitarAccion,
    seleccionarMotivo,
    cambiarDetalleMotivo,
    confirmarAccion,
    cancelarConfirmacion: () => setConfirmacion(null),
    cerrarAviso: () => setAviso(null),
  }
}
