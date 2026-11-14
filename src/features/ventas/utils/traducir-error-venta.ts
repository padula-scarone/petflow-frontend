import {
  crearMensajeConsultaFallida,
  crearMensajeSinPermiso,
  crearMensajeStockInsuficiente,
  MENSAJE_ALTA_FALLIDA,
  MENSAJE_DATOS_NO_COINCIDEN,
  MENSAJE_ITEM_NO_DISPONIBLE,
  MENSAJE_PRODUCTO_SIN_NOMBRE,
  MENSAJE_RESULTADO_INCIERTO,
  MENSAJE_SERVIDOR_NO_DISPONIBLE,
  MENSAJE_SIN_CAJA_ABIERTA,
  MENSAJE_SIN_RED,
  MENSAJE_TIEMPO_AGOTADO,
} from '@/features/ventas/config/mensajes-error-venta'
import type { ErrorEnvioVenta } from '@/features/ventas/types/envio-venta'
import type { ArticuloCarrito } from '@/features/ventas/types/venta'
import type { ErrorApi } from '@/lib/cliente-http.types'

const ESTADO_NO_AUTORIZADO = 401
const ESTADO_DATOS_INVALIDOS = 400
const ESTADO_SIN_PERMISO = 403
const ESTADO_NO_ENCONTRADO = 404
const ESTADO_CONFLICTO = 409
const PRIMER_ESTADO_ERROR_SERVIDOR = 500

/** Formato del 409 de stock del back: "Stock insuficiente para el producto 7". */
const PATRON_STOCK_INSUFICIENTE = /^Stock insuficiente para el producto (\d+)$/

/** Traduce un error de una consulta (GET) a un texto para la vista; nunca muestra el detalle tecnico. */
export function traducirErrorConsulta(error: ErrorApi, recurso: string, accion: string) {
  if (error.tipo === 'SIN_RED') return MENSAJE_SIN_RED
  if (error.tipo === 'TIEMPO_AGOTADO') return MENSAJE_TIEMPO_AGOTADO
  if (error.tipo === 'RESPUESTA_NO_JSON') return MENSAJE_SERVIDOR_NO_DISPONIBLE
  if (error.estado === ESTADO_SIN_PERMISO) return crearMensajeSinPermiso(accion)
  if (error.estado !== null && error.estado >= PRIMER_ESTADO_ERROR_SERVIDOR) {
    return MENSAJE_SERVIDOR_NO_DISPONIBLE
  }
  return crearMensajeConsultaFallida(recurso)
}

/**
 * Traduce un error de POST /api/ventas. Un error del servidor con respuesta JSON de 4xx significa que no se
 * guardo nada (la transaccion es atomica); cualquier otra falla deja en duda si la venta se guardo.
 */
export function traducirErrorRegistroVenta(
  error: ErrorApi,
  articulos: ArticuloCarrito[],
): ErrorEnvioVenta {
  // El cliente HTTP ya cerro la sesion: la pantalla de login reemplaza a esta
  if (error.estado === ESTADO_NO_AUTORIZADO) {
    return { mensaje: null, incierto: false, recargarDatos: false }
  }

  const huboRespuestaDelServidor =
    error.tipo === 'RESPUESTA_DEL_SERVIDOR' &&
    error.estado !== null &&
    error.estado < PRIMER_ESTADO_ERROR_SERVIDOR
  if (!huboRespuestaDelServidor) {
    return { mensaje: MENSAJE_RESULTADO_INCIERTO, incierto: true, recargarDatos: false }
  }

  if (error.estado === ESTADO_SIN_PERMISO) {
    return {
      mensaje: crearMensajeSinPermiso('registrar ventas'),
      incierto: false,
      recargarDatos: false,
    }
  }
  if (error.estado === ESTADO_NO_ENCONTRADO) {
    return { mensaje: MENSAJE_ITEM_NO_DISPONIBLE, incierto: false, recargarDatos: true }
  }
  if (error.estado === ESTADO_CONFLICTO) {
    const coincidencia = PATRON_STOCK_INSUFICIENTE.exec(error.mensaje ?? '')
    if (coincidencia !== null) {
      const articulo = articulos.find((candidato) => candidato.idProducto === coincidencia[1])
      return {
        mensaje: crearMensajeStockInsuficiente(articulo?.nombreProducto ?? MENSAJE_PRODUCTO_SIN_NOMBRE),
        incierto: false,
        recargarDatos: true,
      }
    }
    // Un 409 que no es de stock, en el alta de una venta, solo puede ser la falta de caja abierta
    return { mensaje: MENSAJE_SIN_CAJA_ABIERTA, incierto: false, recargarDatos: false }
  }
  if (error.estado === ESTADO_DATOS_INVALIDOS) {
    return { mensaje: MENSAJE_DATOS_NO_COINCIDEN, incierto: false, recargarDatos: true }
  }
  return { mensaje: MENSAJE_ALTA_FALLIDA, incierto: false, recargarDatos: false }
}
