import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { useUsuarioSesion } from '@/features/auth/hooks/use-usuario-sesion'
import { anularVentaApi } from '@/features/ventas/api/anular-venta-api'
import { consultarVentaApi } from '@/features/ventas/api/consultar-venta-api'
import { convertirDetalleApiAVentaDetalle } from '@/features/ventas/api/convertir-detalle-api-a-venta-detalle'
import {
  crearMensajeYaAnulada,
  MENSAJE_ANULACION_INCIERTA,
  MENSAJE_ANULACION_NO_APLICADA,
  MENSAJE_DETALLE_ILEGIBLE,
  MENSAJE_EDICION_NO_PREPARADA,
  MENSAJE_PLAZO_VENCIDO,
  MENSAJE_VENTA_INEXISTENTE,
} from '@/features/ventas/config/mensajes-error-venta'
import { CODIGO_MOTIVO_OTRO } from '@/features/ventas/config/motivos-venta'
import { RUTAS_REGISTRAR_VENTA } from '@/features/ventas/config/rutas-registrar-venta'
import type { BorradorRepoblado } from '@/features/ventas/types/borrador-repoblado'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type {
  AccionVenta,
  AvisoHistorial,
  CodigoMotivo,
  ConfirmacionAccionVenta,
  ErrorAccionVenta,
  FilaHistorial,
} from '@/features/ventas/types/historial'
import { construirBorradorRepoblado } from '@/features/ventas/utils/construir-borrador-repoblado'
import { construirTextoMotivo } from '@/features/ventas/utils/construir-texto-motivo'
import { CLAVE_BORRADOR_REPOBLADO } from '@/features/ventas/utils/leer-borrador-repoblado'
import { esMotivoValido } from '@/features/ventas/utils/motivos-venta'
import {
  clasificarFalloAccion,
  crearErrorAccionVenta,
  traducirRechazoAnulacion,
} from '@/features/ventas/utils/traducir-error-accion-venta'
import { verificarAnulacionAplicada } from '@/features/ventas/utils/verificar-resultado-venta'

/** Confirmacion abierta tal como se guarda: "motivoValido" se calcula al exponerla. */
type EstadoConfirmacion = Omit<ConfirmacionAccionVenta, 'motivoValido'>

/** Como termino el intento de anular. */
type ResultadoAnulacion =
  | { tipo: 'aplicada'; huboCobro: boolean }
  /** 401: el cliente HTTP ya cerro la sesion. */
  | { tipo: 'sin-sesion' }
  /** `ventaCambio` indica que el servidor mostro un estado distinto al de la pantalla: hay que volver a pedir los datos. */
  | { tipo: 'error'; error: ErrorAccionVenta; ventaCambio: boolean }

/** Como termino la preparacion de la edicion (pedir los items antes de anular). */
type ResultadoPreparacion =
  | { tipo: 'listo'; borrador: BorradorRepoblado }
  | { tipo: 'sin-sesion' }
  | { tipo: 'error'; error: ErrorAccionVenta }

/** Lo que necesita el hook que anula y edita ventas. */
interface OpcionesModificarVenta {
  /** Busca la fila en el detalle abierto o, si no esta, en la lista. */
  buscarFila: (idVenta: number) => FilaHistorial | undefined
  /** Para cruzar el tipo de los pagos al preparar la edicion. */
  medios: MedioPago[]
  /** Hora del servidor menos hora local, para estimar cuando salio un pedido. */
  desfaseServidorMilisegundos: number
  /** El servidor cambio la venta (o la lista quedo vieja): hay que volver a pedir lista y detalle. */
  alCambiarVenta: () => void
}

/**
 * Editar y Anular una venta: confirmacion con motivo, pedido al back y su resultado. Editar pide primero los
 * items de la venta (si ese pedido falla no se anula nada), anula, y recien entonces abre Registrar Venta con
 * los datos cargados. Si el resultado de la anulacion es incierto, consulta el detalle para saber que paso;
 * reintentar es seguro porque el back responde 409 a una segunda anulacion y ese 409 tambien se verifica.
 */
export function useModificarVenta({
  buscarFila,
  medios,
  desfaseServidorMilisegundos,
  alCambiarVenta,
}: OpcionesModificarVenta) {
  const { cliente } = useSesion()
  const usuario = useUsuarioSesion()
  const navegar = useNavigate()

  // --- ESTADOS ---
  const [confirmacion, setConfirmacion] = useState<EstadoConfirmacion | null>(null)
  const [aviso, setAviso] = useState<AvisoHistorial | null>(null)
  // Un ref y no un estado: un segundo toque puede llegar antes del siguiente render
  const envioBloqueadoRef = useRef(false)

  // --- PEDIDOS ---
  /** Pide el detalle de la venta para verificar o para preparar la edicion. */
  const consultarDetalle = (idVenta: number) => consultarVentaApi(cliente, String(idVenta))

  const prepararEdicion = async (idVenta: number): Promise<ResultadoPreparacion> => {
    const respuesta = await consultarDetalle(idVenta)
    if (!respuesta.exitoso) {
      if (clasificarFalloAccion(respuesta.error) === 'sin-sesion') return { tipo: 'sin-sesion' }
      return {
        tipo: 'error',
        error:
          respuesta.error.estado === 404
            ? crearErrorAccionVenta(404, MENSAJE_VENTA_INEXISTENTE, { reintentable: false })
            : crearErrorAccionVenta(null, MENSAJE_EDICION_NO_PREPARADA),
      }
    }
    const venta = convertirDetalleApiAVentaDetalle(respuesta.datos.venta, medios)
    if (venta === null) {
      return { tipo: 'error', error: crearErrorAccionVenta(null, MENSAJE_DETALLE_ILEGIBLE) }
    }
    return { tipo: 'listo', borrador: construirBorradorRepoblado(venta) }
  }

  /** Despues de un 409 o de un resultado incierto: el detalle dice si la anulacion se aplico. */
  const verificarAnulacion = async (
    idVenta: number,
    motivo: string,
    enviadoEnMilisegundos: number,
    fueIncierto: boolean,
    errorOriginal: ErrorAccionVenta,
  ): Promise<ResultadoAnulacion> => {
    const respuesta = await consultarDetalle(idVenta)
    if (!respuesta.exitoso) {
      // Sin poder confirmar el estado no se afirma nada: se avisa que se puede reintentar sin riesgo
      return {
        tipo: 'error',
        error: crearErrorAccionVenta(null, MENSAJE_ANULACION_INCIERTA, { incierto: true }),
        ventaCambio: false,
      }
    }
    const ahoraServidor = Date.now() + respuesta.datos.desfaseServidorMilisegundos
    const verificacion = verificarAnulacionAplicada(
      respuesta.datos.venta,
      { motivo, idUsuario: usuario.idUsuario, enviadoEnMilisegundos },
      ahoraServidor,
    )
    if (verificacion.tipo === 'aplicada') return { tipo: 'aplicada', huboCobro: verificacion.huboCobro }
    if (verificacion.tipo === 'anulada-por-otro') {
      return {
        tipo: 'error',
        error: crearErrorAccionVenta(409, crearMensajeYaAnulada(verificacion.nombreUsuario), {
          reintentable: false,
        }),
        ventaCambio: true,
      }
    }
    if (verificacion.ventanaVencida) {
      return {
        tipo: 'error',
        error: crearErrorAccionVenta(403, MENSAJE_PLAZO_VENCIDO, { reintentable: false }),
        ventaCambio: true,
      }
    }
    // Sigue sin anular y dentro de plazo: un 409 firme es la falta de caja; tras un resultado incierto, no se aplico
    return {
      tipo: 'error',
      error: fueIncierto ? crearErrorAccionVenta(null, MENSAJE_ANULACION_NO_APLICADA) : errorOriginal,
      ventaCambio: false,
    }
  }

  const anularVenta = async (idVenta: number, motivo: string): Promise<ResultadoAnulacion> => {
    const enviadoEnMilisegundos = Date.now() + desfaseServidorMilisegundos
    const respuesta = await anularVentaApi(cliente, idVenta, motivo)
    if (respuesta.exitoso) {
      return { tipo: 'aplicada', huboCobro: respuesta.datos.estadoAnterior === 'COMPLETADA' }
    }

    const clasificacion = clasificarFalloAccion(respuesta.error)
    if (clasificacion === 'sin-sesion') return { tipo: 'sin-sesion' }
    // 400, 403 y 404 son rechazos firmes: nada se anulo. El 403 es ventana vencida aunque la fila dijera otra cosa
    if (clasificacion === 'rechazo' && respuesta.error.estado !== 409) {
      const error = traducirRechazoAnulacion(respuesta.error)
      return { tipo: 'error', error, ventaCambio: error.estadoHttp === 403 || error.estadoHttp === 404 }
    }
    return verificarAnulacion(
      idVenta,
      motivo,
      enviadoEnMilisegundos,
      clasificacion === 'incierto',
      traducirRechazoAnulacion(respuesta.error),
    )
  }

  // --- ACCIONES ---
  const solicitarAccion = (accion: AccionVenta, idVenta: number) => {
    const fila = buscarFila(idVenta)
    // Sin motivo elegido: no hay opcion preseleccionada
    if (fila) {
      setConfirmacion({ accion, fila, enviando: false, error: null, codigoMotivo: null, detalleMotivo: '' })
    }
  }

  const seleccionarMotivo = (codigoMotivo: CodigoMotivo) =>
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
    const idVenta = enCurso.fila.idVenta
    envioBloqueadoRef.current = true
    setConfirmacion({ ...enCurso, enviando: true, error: null })

    try {
      const motivo = construirTextoMotivo(enCurso.codigoMotivo as CodigoMotivo, enCurso.detalleMotivo)

      // Editar: los items se piden antes de anular, asi un fallo no deja una venta anulada sin repoblar
      let borrador: BorradorRepoblado | null = null
      if (enCurso.accion === 'EDITAR') {
        const preparacion = await prepararEdicion(idVenta)
        if (preparacion.tipo === 'sin-sesion') {
          setConfirmacion({ ...enCurso, enviando: false })
          return
        }
        if (preparacion.tipo === 'error') {
          setConfirmacion({ ...enCurso, enviando: false, error: preparacion.error })
          return
        }
        borrador = preparacion.borrador
      }

      const resultado = await anularVenta(idVenta, motivo)
      if (resultado.tipo === 'sin-sesion') {
        setConfirmacion({ ...enCurso, enviando: false })
        return
      }
      if (resultado.tipo === 'error') {
        setConfirmacion({ ...enCurso, enviando: false, error: resultado.error })
        if (resultado.ventaCambio) alCambiarVenta()
        return
      }

      // Aplicada: la verdad la tiene el servidor, se vuelve a pedir lista y detalle
      setConfirmacion(null)
      alCambiarVenta()
      if (borrador !== null) {
        navegar(RUTAS_REGISTRAR_VENTA.carrito, { state: { [CLAVE_BORRADOR_REPOBLADO]: borrador } })
        return
      }
      setAviso({
        mensaje: `Venta ${enCurso.fila.numeroComprobante} anulada. Se repuso el stock${
          resultado.huboCobro ? ' y se revirtió la caja' : ''
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
    solicitarAccion,
    seleccionarMotivo,
    cambiarDetalleMotivo,
    confirmarAccion,
    cancelarConfirmacion: () => setConfirmacion(null),
    cerrarAviso: () => setAviso(null),
  }
}
