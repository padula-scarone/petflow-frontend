import {
  crearMensajeSinPermiso,
  MENSAJE_ANULACION_FALLIDA,
  MENSAJE_ANULACION_SIN_CAJA,
  MENSAJE_COBRO_DATOS_NO_COINCIDEN,
  MENSAJE_COBRO_FALLIDO,
  MENSAJE_COBRO_SIN_CAJA,
  MENSAJE_MOTIVO_INVALIDO,
  MENSAJE_PLAZO_VENCIDO,
  MENSAJE_VENTA_INEXISTENTE,
} from '@/features/ventas/config/mensajes-error-venta'
import type { ErrorAccionVenta } from '@/features/ventas/types/historial'
import type { ErrorApi } from '@/lib/cliente-http.types'

const ESTADO_NO_AUTORIZADO = 401
const ESTADO_DATOS_INVALIDOS = 400
const ESTADO_SIN_PERMISO = 403
const ESTADO_NO_ENCONTRADO = 404
const ESTADO_CONFLICTO = 409
const PRIMER_ESTADO_ERROR_SERVIDOR = 500

/**
 * El 403 por rol ("No tiene permiso para realizar esta accion") y el 403 de ventana vencida comparten
 * estado: el back no manda un codigo, solo se distinguen por el mensaje. Las tres rutas admiten a los tres roles
 * de la app, asi que el de rol casi no puede ocurrir; cualquier otro 403 es la ventana vencida.
 */
const PATRON_SIN_PERMISO = /^no tiene permiso/i

/** Como termino un pedido de accion (POST) que no fue un 200. */
export type ClasificacionFallo =
  /** 401: el cliente HTTP ya cerro la sesion; la pantalla de login reemplaza a esta. */
  | 'sin-sesion'
  /** El back respondio con un 4xx: la accion no se aplico. El 409 puede ser la repeticion de una que si se aplico. */
  | 'rechazo'
  /** Sin red, tiempo agotado, respuesta ilegible o 5xx: la accion pudo haberse aplicado. */
  | 'incierto'

export function clasificarFalloAccion(error: ErrorApi): ClasificacionFallo {
  if (error.estado === ESTADO_NO_AUTORIZADO) return 'sin-sesion'
  const huboRespuestaDelServidor =
    error.tipo === 'RESPUESTA_DEL_SERVIDOR' &&
    error.estado !== null &&
    error.estado < PRIMER_ESTADO_ERROR_SERVIDOR
  return huboRespuestaDelServidor ? 'rechazo' : 'incierto'
}

/** Arma un error de accion. Por defecto es un rechazo firme: no es incierto y se puede reintentar. */
export function crearErrorAccionVenta(
  estadoHttp: ErrorAccionVenta['estadoHttp'],
  mensaje: string,
  opciones: { incierto?: boolean; reintentable?: boolean } = {},
): ErrorAccionVenta {
  return {
    estadoHttp,
    mensaje,
    incierto: opciones.incierto ?? false,
    reintentable: opciones.reintentable ?? true,
  }
}

/** Traduce un rechazo (4xx) de la anulacion. El 409 lo resuelve quien llama consultando el detalle. */
export function traducirRechazoAnulacion(error: ErrorApi): ErrorAccionVenta {
  if (error.estado === ESTADO_DATOS_INVALIDOS) {
    return crearErrorAccionVenta(400, MENSAJE_MOTIVO_INVALIDO)
  }
  if (error.estado === ESTADO_SIN_PERMISO) {
    return PATRON_SIN_PERMISO.test(error.mensaje ?? '')
      ? crearErrorAccionVenta(403, crearMensajeSinPermiso('editar ni anular ventas'), { reintentable: false })
      : crearErrorAccionVenta(403, MENSAJE_PLAZO_VENCIDO, { reintentable: false })
  }
  if (error.estado === ESTADO_NO_ENCONTRADO) {
    return crearErrorAccionVenta(404, MENSAJE_VENTA_INEXISTENTE, { reintentable: false })
  }
  if (error.estado === ESTADO_CONFLICTO) return crearErrorAccionVenta(409, MENSAJE_ANULACION_SIN_CAJA)
  return crearErrorAccionVenta(null, MENSAJE_ANULACION_FALLIDA)
}

/** Traduce un rechazo (4xx) del cobro de un fiado. El 409 lo resuelve quien llama consultando el detalle. */
export function traducirRechazoCobro(error: ErrorApi): ErrorAccionVenta {
  if (error.estado === ESTADO_DATOS_INVALIDOS) {
    return crearErrorAccionVenta(400, MENSAJE_COBRO_DATOS_NO_COINCIDEN)
  }
  if (error.estado === ESTADO_SIN_PERMISO) {
    return crearErrorAccionVenta(403, crearMensajeSinPermiso('cobrar fiados'), { reintentable: false })
  }
  if (error.estado === ESTADO_NO_ENCONTRADO) {
    return crearErrorAccionVenta(404, MENSAJE_VENTA_INEXISTENTE, { reintentable: false })
  }
  if (error.estado === ESTADO_CONFLICTO) return crearErrorAccionVenta(409, MENSAJE_COBRO_SIN_CAJA)
  return crearErrorAccionVenta(null, MENSAJE_COBRO_FALLIDO)
}
