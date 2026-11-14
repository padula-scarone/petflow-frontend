import {
  MENSAJE_ALTA_CAMBIO_CANTIDAD_EXCEDE_VENTA,
  MENSAJE_ALTA_CAMBIO_DATOS_NO_COINCIDEN,
  MENSAJE_ALTA_CAMBIO_FALLIDA,
  MENSAJE_ALTA_CAMBIO_ITEM_NO_DISPONIBLE,
  MENSAJE_ALTA_CAMBIO_SALDO_NEGATIVO,
  MENSAJE_ALTA_CAMBIO_SIN_CAJA,
  MENSAJE_ALTA_CAMBIO_SIN_STOCK,
  MENSAJE_ALTA_CAMBIO_VENTA_INEXISTENTE,
  MENSAJE_ALTA_CAMBIO_VENTA_NO_VINCULABLE,
  MENSAJE_ANULACION_CAMBIO_FALLIDA,
  MENSAJE_ANULACION_CAMBIO_SIN_CAJA,
  MENSAJE_ANULACION_CAMBIO_STOCK_NO_REVERTIBLE,
  MENSAJE_CAMBIO_INEXISTENTE,
  MENSAJE_PLAZO_VENCIDO_CAMBIO,
  crearMensajeCambioYaAnulado,
} from '@/features/ventas/cambios-mercaderia/config/mensajes-error-cambio'
import type { CodigoErrorCambio } from '@/features/ventas/cambios-mercaderia/types/api-cambios'
import type { ErrorAccionCambio } from '@/features/ventas/cambios-mercaderia/types/cambio'
import {
  crearMensajeSinPermiso,
  MENSAJE_MOTIVO_INVALIDO,
} from '@/features/ventas/config/mensajes-error-venta'
import type { ErrorApi } from '@/lib/cliente-http.types'

const ESTADO_DATOS_INVALIDOS = 400
const ESTADO_SIN_PERMISO = 403
const ESTADO_NO_ENCONTRADO = 404
const ESTADO_CONFLICTO = 409

const CODIGOS_ERROR_CAMBIO: Record<CodigoErrorCambio, true> = {
  DATOS_INVALIDOS: true,
  SALDO_NEGATIVO: true,
  VENTA_NO_ENCONTRADA: true,
  CAMBIO_NO_ENCONTRADO: true,
  SIN_CAJA_ABIERTA: true,
  STOCK_INSUFICIENTE: true,
  VENTA_NO_VINCULABLE: true,
  CANTIDAD_EXCEDE_VENTA: true,
  PLAZO_VENCIDO: true,
  CAMBIO_YA_ANULADO: true,
  STOCK_INSUFICIENTE_PARA_REVERTIR: true,
}

/** Lee el `codigo` del back como un CodigoErrorCambio; null si no vino o no es uno conocido. */
export function leerCodigoErrorCambio(error: ErrorApi): CodigoErrorCambio | null {
  return error.codigo !== null && Object.hasOwn(CODIGOS_ERROR_CAMBIO, error.codigo)
    ? (error.codigo as CodigoErrorCambio)
    : null
}

function leerEstadoHttp(error: ErrorApi): ErrorAccionCambio['estadoHttp'] {
  const { estado } = error
  return estado === 400 || estado === 403 || estado === 404 || estado === 409 ? estado : null
}

/** Arma un error de accion. Por defecto es un rechazo firme: no es incierto y se puede reintentar. */
export function crearErrorAccionCambio(
  error: Pick<ErrorAccionCambio, 'estadoHttp' | 'codigo'>,
  mensaje: string,
  opciones: { incierto?: boolean; reintentable?: boolean } = {},
): ErrorAccionCambio {
  return {
    estadoHttp: error.estadoHttp,
    codigo: error.codigo,
    mensaje,
    incierto: opciones.incierto ?? false,
    reintentable: opciones.reintentable ?? true,
  }
}

/** Traduce un rechazo (4xx) del alta de un cambio: nada se guardo, se puede corregir y reintentar. */
export function traducirRechazoAltaCambio(error: ErrorApi): ErrorAccionCambio {
  const referencia = { estadoHttp: leerEstadoHttp(error), codigo: leerCodigoErrorCambio(error) }
  const crear = (mensaje: string) => crearErrorAccionCambio(referencia, mensaje)

  if (error.estado === ESTADO_DATOS_INVALIDOS) {
    return crear(
      referencia.codigo === 'SALDO_NEGATIVO'
        ? MENSAJE_ALTA_CAMBIO_SALDO_NEGATIVO
        : MENSAJE_ALTA_CAMBIO_DATOS_NO_COINCIDEN,
    )
  }
  // Los 403 de autenticacion no traen codigo: es falta de permiso
  if (error.estado === ESTADO_SIN_PERMISO) {
    return crearErrorAccionCambio(referencia, crearMensajeSinPermiso('registrar cambios'), { reintentable: false })
  }
  if (error.estado === ESTADO_NO_ENCONTRADO) {
    // Producto o medio de pago inexistente llegan como 404 con DATOS_INVALIDOS
    return crear(
      referencia.codigo === 'VENTA_NO_ENCONTRADA'
        ? MENSAJE_ALTA_CAMBIO_VENTA_INEXISTENTE
        : MENSAJE_ALTA_CAMBIO_ITEM_NO_DISPONIBLE,
    )
  }
  if (error.estado === ESTADO_CONFLICTO) {
    switch (referencia.codigo) {
      case 'VENTA_NO_VINCULABLE':
        return crear(MENSAJE_ALTA_CAMBIO_VENTA_NO_VINCULABLE)
      case 'CANTIDAD_EXCEDE_VENTA':
        return crear(MENSAJE_ALTA_CAMBIO_CANTIDAD_EXCEDE_VENTA)
      case 'SIN_CAJA_ABIERTA':
        return crear(MENSAJE_ALTA_CAMBIO_SIN_CAJA)
      case 'STOCK_INSUFICIENTE':
        return crear(MENSAJE_ALTA_CAMBIO_SIN_STOCK)
      default:
        return crear(MENSAJE_ALTA_CAMBIO_FALLIDA)
    }
  }
  return crear(MENSAJE_ALTA_CAMBIO_FALLIDA)
}

/**
 * Traduce un rechazo (4xx) de la anulacion de un cambio. El 409 CAMBIO_YA_ANULADO lo resuelve quien llama
 * consultando el detalle: si la anulacion anterior fue la propia, no es un error.
 */
export function traducirRechazoAnulacionCambio(error: ErrorApi): ErrorAccionCambio {
  const referencia = { estadoHttp: leerEstadoHttp(error), codigo: leerCodigoErrorCambio(error) }

  if (error.estado === ESTADO_DATOS_INVALIDOS) {
    return crearErrorAccionCambio(referencia, MENSAJE_MOTIVO_INVALIDO)
  }
  if (error.estado === ESTADO_SIN_PERMISO) {
    // Con PLAZO_VENCIDO es la ventana; un 403 sin codigo es falta de permiso
    return referencia.codigo === 'PLAZO_VENCIDO'
      ? crearErrorAccionCambio(referencia, MENSAJE_PLAZO_VENCIDO_CAMBIO, { reintentable: false })
      : crearErrorAccionCambio(referencia, crearMensajeSinPermiso('editar ni anular cambios'), {
          reintentable: false,
        })
  }
  if (error.estado === ESTADO_NO_ENCONTRADO) {
    return crearErrorAccionCambio(referencia, MENSAJE_CAMBIO_INEXISTENTE, { reintentable: false })
  }
  if (error.estado === ESTADO_CONFLICTO) {
    switch (referencia.codigo) {
      case 'SIN_CAJA_ABIERTA':
        return crearErrorAccionCambio(referencia, MENSAJE_ANULACION_CAMBIO_SIN_CAJA)
      case 'STOCK_INSUFICIENTE_PARA_REVERTIR':
        return crearErrorAccionCambio(referencia, MENSAJE_ANULACION_CAMBIO_STOCK_NO_REVERTIBLE, {
          reintentable: false,
        })
      case 'CAMBIO_YA_ANULADO':
        return crearErrorAccionCambio(referencia, crearMensajeCambioYaAnulado(null), { reintentable: false })
      default:
        return crearErrorAccionCambio(referencia, MENSAJE_ANULACION_CAMBIO_FALLIDA)
    }
  }
  return crearErrorAccionCambio(referencia, MENSAJE_ANULACION_CAMBIO_FALLIDA)
}
