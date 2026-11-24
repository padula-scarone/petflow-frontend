import { useRef, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { useUsuarioSesion } from '@/features/auth/hooks/use-usuario-sesion'
import { anularVentaApi } from '@/features/ventas/api/anular-venta-api'
import { consultarVentaApi } from '@/features/ventas/api/consultar-venta-api'
import {
  crearMensajeYaAnulada,
  MENSAJE_ANULACION_INCIERTA,
  MENSAJE_ANULACION_NO_APLICADA,
  MENSAJE_PLAZO_VENCIDO,
} from '@/features/ventas/config/mensajes-error-venta'
import { CODIGO_MOTIVO_OTRO } from '@/features/ventas/config/motivos-venta'
import type {
  AvisoHistorial,
  CodigoMotivo,
  ConfirmacionAccionVenta,
  ErrorAccionVenta,
  FilaHistorial,
} from '@/features/ventas/types/historial'
import { construirTextoMotivo } from '@/features/ventas/utils/construir-texto-motivo'
import { esMotivoValido } from '@/features/ventas/utils/motivos-venta'
import {
  clasificarFalloAccion,
  CODIGO_FIADO_CON_COBROS,
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

/** Lo que necesita el hook que anula ventas. */
interface OpcionesAnularVenta {
  /** Busca la fila en el detalle abierto o, si no esta, en la lista. */
  buscarFila: (idVenta: number) => FilaHistorial | undefined
  /** Hora del servidor menos hora local, para estimar cuando salio un pedido. */
  desfaseServidorMilisegundos: number
  /** El servidor cambio la venta (o la lista quedo vieja): hay que volver a pedir lista y detalle. */
  alCambiarVenta: () => void
}

/**
 * Anular una venta: confirmacion con motivo, pedido al back y su resultado. Si el resultado de la anulacion es
 * incierto, consulta el detalle para saber que paso; reintentar es seguro porque el back responde 409 a una
 * segunda anulacion y ese 409 tambien se verifica.
 */
export function useAnularVenta({ buscarFila, desfaseServidorMilisegundos, alCambiarVenta }: OpcionesAnularVenta) {
  const { cliente } = useSesion()
  const usuario = useUsuarioSesion()

  // --- ESTADOS ---
  const [confirmacion, setConfirmacion] = useState<EstadoConfirmacion | null>(null)
  const [aviso, setAviso] = useState<AvisoHistorial | null>(null)
  // Un ref y no un estado: un segundo toque puede llegar antes del siguiente render
  const envioBloqueadoRef = useRef(false)

  // --- PEDIDOS ---
  /** Pide el detalle de la venta para verificar si la anulacion se aplico. */
  const consultarDetalle = (idVenta: number) => consultarVentaApi(cliente, String(idVenta))

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
    // 400, 403 y 404 son rechazos firmes: nada se anulo. El 403 es ventana vencida aunque la fila dijera otra cosa.
    // Tambien lo es el 409 de un fiado con cobros: no es una repeticion ni "ya anulada", asi que no hay nada que verificar
    const esFiadoConCobros = respuesta.error.estado === 409 && respuesta.error.codigo === CODIGO_FIADO_CON_COBROS
    if (clasificacion === 'rechazo' && (respuesta.error.estado !== 409 || esFiadoConCobros)) {
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
  const solicitarAnulacion = (idVenta: number) => {
    const fila = buscarFila(idVenta)
    // Sin motivo elegido: no hay opcion preseleccionada
    if (fila) {
      setConfirmacion({ fila, enviando: false, error: null, codigoMotivo: null, detalleMotivo: '' })
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

  const confirmarAnulacion = async () => {
    if (confirmacion === null || envioBloqueadoRef.current) return
    // El front no deja confirmar sin motivo; el servidor tambien lo validaria (400)
    if (!esMotivoValido(confirmacion.codigoMotivo, confirmacion.detalleMotivo)) return
    const enCurso = confirmacion
    const idVenta = enCurso.fila.idVenta
    envioBloqueadoRef.current = true
    setConfirmacion({ ...enCurso, enviando: true, error: null })

    try {
      const motivo = construirTextoMotivo(enCurso.codigoMotivo as CodigoMotivo, enCurso.detalleMotivo)

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
    solicitarAnulacion,
    seleccionarMotivo,
    cambiarDetalleMotivo,
    confirmarAnulacion,
    cancelarConfirmacion: () => setConfirmacion(null),
    cerrarAviso: () => setAviso(null),
  }
}
