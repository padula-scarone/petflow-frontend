import { esObjeto } from '@/lib/es-objeto'
import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import { crearFalloRespuestaInvalida } from '@/features/ventas/api/crear-fallo-respuesta-invalida'
import {
  esEstadoVentaApi,
  esFormatoVentaApi,
  esModalidadEntregaApi,
  esOrigenApi,
} from '@/features/ventas/api/conversores-enums'
import type {
  ConsultarVentaResponse,
  ItemDetalleApi,
  PagoDetalleApi,
  VentaDetalleApi,
} from '@/features/ventas/types/api-ventas'

/** Detalle validado de una venta, con el desfase entre el reloj del servidor y el del dispositivo. */
export interface DetalleVentaConsultado {
  venta: VentaDetalleApi
  /** Hora del servidor menos hora local, en milisegundos, medida al recibir la respuesta. */
  desfaseServidorMilisegundos: number
}

function esTextoOpcional(valor: unknown) {
  return valor === null || typeof valor === 'string'
}

function esItemDetalleApi(valor: unknown): valor is ItemDetalleApi {
  return (
    esObjeto(valor) &&
    typeof valor.idProducto === 'number' &&
    typeof valor.nombreProducto === 'string' &&
    esFormatoVentaApi(valor.formatoVenta) &&
    typeof valor.cantidad === 'string' &&
    typeof valor.precioUnitario === 'string' &&
    typeof valor.subtotal === 'string'
  )
}

function esPagoDetalleApi(valor: unknown): valor is PagoDetalleApi {
  return (
    esObjeto(valor) &&
    typeof valor.idMedioPago === 'number' &&
    typeof valor.nombreMedioPago === 'string' &&
    typeof valor.montoBase === 'string' &&
    typeof valor.porcentajeAplicado === 'string' &&
    typeof valor.montoFinal === 'string' &&
    esTextoOpcional(valor.montoRecibido) &&
    esTextoOpcional(valor.vuelto)
  )
}

function esVentaDetalleApi(valor: unknown): valor is VentaDetalleApi {
  return (
    esObjeto(valor) &&
    typeof valor.idVenta === 'number' &&
    esTextoOpcional(valor.numeroComprobante) &&
    typeof valor.fechaHora === 'string' &&
    (esEstadoVentaApi(valor.estado) || valor.estado === 'ANULADA') &&
    esTextoOpcional(valor.fechaHoraLimiteModificacion) &&
    esOrigenApi(valor.origen) &&
    esModalidadEntregaApi(valor.modalidadEntrega) &&
    esTextoOpcional(valor.clienteReferencia) &&
    esObjeto(valor.vendedor) &&
    typeof valor.vendedor.idUsuario === 'number' &&
    typeof valor.vendedor.nombre === 'string' &&
    typeof valor.subtotalBruto === 'string' &&
    typeof valor.descuentoManual === 'string' &&
    esTextoOpcional(valor.motivoDescuento) &&
    typeof valor.montoTotal === 'string' &&
    Array.isArray(valor.items) &&
    valor.items.every(esItemDetalleApi) &&
    Array.isArray(valor.pagos) &&
    valor.pagos.every(esPagoDetalleApi)
  )
}

function esConsultarVentaResponse(valor: unknown): valor is ConsultarVentaResponse {
  return (
    esObjeto(valor) &&
    typeof valor.fechaHoraServidor === 'string' &&
    !Number.isNaN(Date.parse(valor.fechaHoraServidor)) &&
    esVentaDetalleApi(valor.venta)
  )
}

/**
 * GET /api/ventas/:idVenta. Devuelve el detalle validado; armar el Comprobante con el, cruzando los medios
 * de pago cargados, lo hace `convertirDetalleApiAComprobante`.
 */
export async function consultarVentaApi(
  cliente: ClienteHttp,
  idVenta: string,
): Promise<ResultadoApi<DetalleVentaConsultado>> {
  const resultado = await cliente.solicitar<unknown>(`/api/ventas/${encodeURIComponent(idVenta)}`)
  if (!resultado.exitoso) return resultado
  if (!esConsultarVentaResponse(resultado.datos)) return crearFalloRespuestaInvalida(200)

  return {
    exitoso: true,
    datos: {
      venta: resultado.datos.venta,
      desfaseServidorMilisegundos: Date.parse(resultado.datos.fechaHoraServidor) - Date.now(),
    },
  }
}
