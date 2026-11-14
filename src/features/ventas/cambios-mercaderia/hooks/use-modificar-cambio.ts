import { useRef, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { useUsuarioSesion } from '@/features/auth/hooks/use-usuario-sesion'
import { anularCambioApi } from '@/features/ventas/cambios-mercaderia/api/anular-cambio-api'
import { consultarCambioApi } from '@/features/ventas/cambios-mercaderia/api/consultar-cambio-api'
import { convertirDetalleApiAVentaVinculada } from '@/features/ventas/cambios-mercaderia/api/convertir-detalle-api-a-venta-vinculada'
import {
  crearMensajeCambioYaAnulado,
  MENSAJE_ANULACION_CAMBIO_INCIERTA,
  MENSAJE_ANULACION_CAMBIO_NO_APLICADA,
  MENSAJE_CAMBIO_INEXISTENTE,
  MENSAJE_DETALLE_CAMBIO_ILEGIBLE,
  MENSAJE_EDICION_CAMBIO_NO_PREPARADA,
  MENSAJE_PLAZO_VENCIDO_CAMBIO,
} from '@/features/ventas/cambios-mercaderia/config/mensajes-error-cambio'
import { esVentaVinculable } from '@/features/ventas/cambios-mercaderia/config/reglas-cambios'
import {
  ETIQUETA_POR_MOTIVO_CAMBIO,
} from '@/features/ventas/cambios-mercaderia/config/motivos-cambio'
import type {
  AccionCambio,
  AltaRepoblada,
  AvisoCambios,
  ConfirmacionAccionCambio,
  ErrorAccionCambio,
  FilaCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import {
  construirAltaRepoblada,
  type VentaParaRepoblar,
} from '@/features/ventas/cambios-mercaderia/utils/construir-alta-repoblada'
import { convertirProductoACatalogoCambio } from '@/features/ventas/cambios-mercaderia/utils/catalogo-cambios'
import {
  crearErrorAccionCambio,
  leerCodigoErrorCambio,
  traducirRechazoAnulacionCambio,
} from '@/features/ventas/cambios-mercaderia/utils/traducir-error-cambio'
import { verificarAnulacionCambioAplicada } from '@/features/ventas/cambios-mercaderia/utils/verificar-resultado-cambio'
import { consultarProductosApi } from '@/features/ventas/api/consultar-productos-api'
import { consultarVentaApi } from '@/features/ventas/api/consultar-venta-api'
import { CODIGO_MOTIVO_OTRO } from '@/features/ventas/config/motivos-venta'
import type { MedioPago } from '@/features/ventas/types/cobro'
import { construirTextoMotivoConEtiquetas } from '@/features/ventas/utils/construir-texto-motivo'
import { esMotivoValido } from '@/features/ventas/utils/motivos-venta'
import { clasificarFalloAccion } from '@/features/ventas/utils/traducir-error-accion-venta'

/** Confirmacion abierta tal como se guarda: "motivoValido" se calcula al exponerla. */
type EstadoConfirmacion = Omit<ConfirmacionAccionCambio, 'motivoValido'>

/** Como termino el intento de anular. */
type ResultadoAnulacion =
  | { tipo: 'aplicada'; huboSaldo: boolean }
  /** 401: el cliente HTTP ya cerro la sesion. */
  | { tipo: 'sin-sesion' }
  /** `cambioModificado` indica que el servidor mostro un estado distinto al de la pantalla: hay que volver a pedir los datos. */
  | { tipo: 'error'; error: ErrorAccionCambio; cambioModificado: boolean }

/** Como termino la preparacion de la edicion (juntar todo antes de anular). */
type ResultadoPreparacion =
  | { tipo: 'listo'; alta: AltaRepoblada }
  | { tipo: 'sin-sesion' }
  | { tipo: 'error'; error: ErrorAccionCambio; cambioModificado: boolean }

/** Lo que necesita el hook que anula y edita cambios. */
interface OpcionesModificarCambio {
  /** Busca la fila en el detalle abierto o, si no esta, en la lista. */
  buscarFila: (idCambio: number) => FilaCambio | undefined
  /** Para cruzar el tipo del medio de pago al repoblar la edicion. */
  medios: MedioPago[]
  /** Hora del servidor menos hora local, para estimar cuando salio un pedido. */
  desfaseServidorMilisegundos: number
  /** El servidor cambio el cambio (o la lista quedo vieja): hay que volver a pedir lista y detalle. */
  alCambiarCambio: () => void
  /** Editar anulo el cambio: se reabre el alta con sus datos. */
  alReabrirAlta: (alta: AltaRepoblada) => void
}

const SIN_REFERENCIA = { estadoHttp: null, codigo: null } as const

/**
 * Editar y Anular un cambio: confirmacion con motivo, pedido al back y su resultado. Editar es anular y volver a
 * cargar con el alta (no hay endpoint de edicion): junta ANTES de anular todo lo necesario para repoblar (el
 * cambio, la venta vinculada y el catalogo), asi un GET que falla no deja un cambio anulado sin repoblar.
 * Si el resultado de la anulacion es incierto, consulta el detalle para saber que paso; reintentar es seguro
 * porque el back responde 409 a una segunda anulacion y ese 409 tambien se verifica.
 */
export function useModificarCambio({
  buscarFila,
  medios,
  desfaseServidorMilisegundos,
  alCambiarCambio,
  alReabrirAlta,
}: OpcionesModificarCambio) {
  const { cliente } = useSesion()
  const usuario = useUsuarioSesion()

  // --- ESTADOS ---
  const [confirmacion, setConfirmacion] = useState<EstadoConfirmacion | null>(null)
  const [aviso, setAviso] = useState<AvisoCambios | null>(null)
  // Un ref y no un estado: un segundo toque puede llegar antes del siguiente render
  const envioBloqueadoRef = useRef(false)

  // --- PEDIDOS ---
  const prepararEdicion = async (idCambio: number): Promise<ResultadoPreparacion> => {
    const falloNoPreparado = (error?: ErrorAccionCambio, cambioModificado = false): ResultadoPreparacion => ({
      tipo: 'error',
      error: error ?? crearErrorAccionCambio(SIN_REFERENCIA, MENSAJE_EDICION_CAMBIO_NO_PREPARADA),
      cambioModificado,
    })

    const [respuestaCambio, respuestaCatalogo] = await Promise.all([
      consultarCambioApi(cliente, idCambio),
      consultarProductosApi(cliente),
    ])
    for (const respuesta of [respuestaCambio, respuestaCatalogo]) {
      if (!respuesta.exitoso && clasificarFalloAccion(respuesta.error) === 'sin-sesion') {
        return { tipo: 'sin-sesion' }
      }
    }
    if (!respuestaCambio.exitoso) {
      return respuestaCambio.error.estado === 404
        ? falloNoPreparado(
            crearErrorAccionCambio({ estadoHttp: 404, codigo: 'CAMBIO_NO_ENCONTRADO' }, MENSAJE_CAMBIO_INEXISTENTE, {
              reintentable: false,
            }),
            true,
          )
        : falloNoPreparado()
    }
    if (!respuestaCatalogo.exitoso) return falloNoPreparado()

    const { cambio, desfaseServidorMilisegundos: desfaseDelDetalle } = respuestaCambio.datos
    // Con el detalle fresco ya se sabe si el back lo va a rechazar: no se anula ni se intenta
    if (cambio.estado === 'ANULADO') {
      const nombre = cambio.anulacion?.nombreUsuario ?? null
      return falloNoPreparado(
        crearErrorAccionCambio(
          { estadoHttp: 409, codigo: 'CAMBIO_YA_ANULADO' },
          crearMensajeCambioYaAnulado(nombre),
          { reintentable: false },
        ),
        true,
      )
    }
    const limite = cambio.fechaHoraLimiteModificacion
    if (limite !== null && Date.parse(limite) <= Date.now() + desfaseDelDetalle) {
      return falloNoPreparado(
        crearErrorAccionCambio({ estadoHttp: 403, codigo: 'PLAZO_VENCIDO' }, MENSAJE_PLAZO_VENCIDO_CAMBIO, {
          reintentable: false,
        }),
        true,
      )
    }
    // Sin los medios cargados no se puede cruzar el tipo del medio del cobro
    if (cambio.pagoSaldo !== null && medios.length === 0) return falloNoPreparado()

    // --- VENTA VINCULADA ---
    let venta: VentaParaRepoblar = { tipo: 'sin-venta' }
    if (cambio.ventaVinculada !== null) {
      const respuestaVenta = await consultarVentaApi(cliente, String(cambio.ventaVinculada.idVenta))
      if (!respuestaVenta.exitoso) {
        if (clasificarFalloAccion(respuestaVenta.error) === 'sin-sesion') return { tipo: 'sin-sesion' }
        // Un 404 es firme (la venta no esta); cualquier otro fallo impide juntar lo necesario: no se anula nada
        if (respuestaVenta.error.estado !== 404) return falloNoPreparado()
        venta = { tipo: 'no-disponible' }
      } else {
        const vinculada = convertirDetalleApiAVentaVinculada(respuestaVenta.datos.venta, medios, respuestaCatalogo.datos)
        if (vinculada === null) {
          return falloNoPreparado(
            crearErrorAccionCambio(SIN_REFERENCIA, MENSAJE_DETALLE_CAMBIO_ILEGIBLE),
          )
        }
        venta = esVentaVinculable(vinculada.estado) ? { tipo: 'vinculada', venta: vinculada } : { tipo: 'no-vinculable' }
      }
    }

    return {
      tipo: 'listo',
      alta: construirAltaRepoblada({
        cambio,
        venta,
        catalogo: respuestaCatalogo.datos.map(convertirProductoACatalogoCambio),
        medios,
      }),
    }
  }

  /** Despues de un 409 o de un resultado incierto: el detalle dice si la anulacion se aplico. */
  const verificarAnulacion = async (
    idCambio: number,
    motivo: string,
    enviadoEnMilisegundos: number,
    fueIncierto: boolean,
    errorOriginal: ErrorAccionCambio,
  ): Promise<ResultadoAnulacion> => {
    const respuesta = await consultarCambioApi(cliente, idCambio)
    if (!respuesta.exitoso) {
      // Sin poder confirmar el estado no se afirma nada: se avisa que se puede reintentar sin riesgo
      return {
        tipo: 'error',
        error: crearErrorAccionCambio(SIN_REFERENCIA, MENSAJE_ANULACION_CAMBIO_INCIERTA, { incierto: true }),
        cambioModificado: false,
      }
    }
    const ahoraServidor = Date.now() + respuesta.datos.desfaseServidorMilisegundos
    const verificacion = verificarAnulacionCambioAplicada(
      respuesta.datos.cambio,
      { motivo, idUsuario: usuario.idUsuario, enviadoEnMilisegundos },
      ahoraServidor,
    )
    if (verificacion.tipo === 'aplicada') return { tipo: 'aplicada', huboSaldo: verificacion.huboSaldo }
    if (verificacion.tipo === 'anulada-por-otro') {
      return {
        tipo: 'error',
        error: crearErrorAccionCambio(
          { estadoHttp: 409, codigo: 'CAMBIO_YA_ANULADO' },
          crearMensajeCambioYaAnulado(verificacion.nombreUsuario),
          { reintentable: false },
        ),
        cambioModificado: true,
      }
    }
    if (verificacion.ventanaVencida) {
      return {
        tipo: 'error',
        error: crearErrorAccionCambio({ estadoHttp: 403, codigo: 'PLAZO_VENCIDO' }, MENSAJE_PLAZO_VENCIDO_CAMBIO, {
          reintentable: false,
        }),
        cambioModificado: true,
      }
    }
    // Sigue sin anular y dentro de plazo: tras un resultado incierto, no se aplico; un 409 firme es el que se mostro
    return {
      tipo: 'error',
      error: fueIncierto
        ? crearErrorAccionCambio(SIN_REFERENCIA, MENSAJE_ANULACION_CAMBIO_NO_APLICADA)
        : errorOriginal,
      cambioModificado: false,
    }
  }

  const anularCambio = async (idCambio: number, motivo: string): Promise<ResultadoAnulacion> => {
    const enviadoEnMilisegundos = Date.now() + desfaseServidorMilisegundos
    const respuesta = await anularCambioApi(cliente, idCambio, motivo)
    if (respuesta.exitoso) {
      return { tipo: 'aplicada', huboSaldo: respuesta.datos.cambio.saldoResultante > 0 }
    }

    const clasificacion = clasificarFalloAccion(respuesta.error)
    if (clasificacion === 'sin-sesion') return { tipo: 'sin-sesion' }
    const errorTraducido = traducirRechazoAnulacionCambio(respuesta.error)

    // Un 409 CAMBIO_YA_ANULADO puede ser la repeticion de una anulacion que si se guardo: se verifica.
    // Los demas rechazos (400, 403, 404 y los 409 de caja o stock) son firmes: nada se anulo.
    const codigo = leerCodigoErrorCambio(respuesta.error)
    const requiereVerificar =
      clasificacion === 'incierto' ||
      (respuesta.error.estado === 409 && (codigo === 'CAMBIO_YA_ANULADO' || codigo === null))
    if (!requiereVerificar) {
      return { tipo: 'error', error: errorTraducido, cambioModificado: respuesta.error.estado === 403 || respuesta.error.estado === 404 }
    }
    return verificarAnulacion(idCambio, motivo, enviadoEnMilisegundos, clasificacion === 'incierto', errorTraducido)
  }

  // --- ACCIONES ---
  const solicitarAccion = (accion: AccionCambio, idCambio: number) => {
    const fila = buscarFila(idCambio)
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
    const idCambio = enCurso.fila.idCambio
    envioBloqueadoRef.current = true
    setConfirmacion({ ...enCurso, enviando: true, error: null })

    try {
      // Anular y Editar mandan el mismo texto: el back no distingue una accion de la otra
      const motivo = construirTextoMotivoConEtiquetas(
        enCurso.codigoMotivo as string,
        enCurso.detalleMotivo,
        ETIQUETA_POR_MOTIVO_CAMBIO,
      )

      // Editar: todo lo necesario para repoblar se junta antes de anular
      let alta: AltaRepoblada | null = null
      if (enCurso.accion === 'EDITAR') {
        const preparacion = await prepararEdicion(idCambio)
        if (preparacion.tipo === 'sin-sesion') {
          setConfirmacion({ ...enCurso, enviando: false })
          return
        }
        if (preparacion.tipo === 'error') {
          setConfirmacion({ ...enCurso, enviando: false, error: preparacion.error })
          if (preparacion.cambioModificado) alCambiarCambio()
          return
        }
        alta = preparacion.alta
      }

      const resultado = await anularCambio(idCambio, motivo)
      if (resultado.tipo === 'sin-sesion') {
        setConfirmacion({ ...enCurso, enviando: false })
        return
      }
      if (resultado.tipo === 'error') {
        setConfirmacion({ ...enCurso, enviando: false, error: resultado.error })
        if (resultado.cambioModificado) alCambiarCambio()
        return
      }

      // Aplicada: la verdad la tiene el servidor, se vuelve a pedir lista y detalle
      setConfirmacion(null)
      alCambiarCambio()
      if (alta !== null) {
        alReabrirAlta(alta)
        return
      }
      setAviso({
        mensaje: `Cambio ${idCambio} anulado. Se repuso el stock${
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
