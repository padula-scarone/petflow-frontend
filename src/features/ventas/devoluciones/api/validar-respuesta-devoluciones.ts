import { esObjeto } from '@/lib/es-objeto'
import { esFormatoVentaApi, esModalidadEntregaApi } from '@/features/ventas/api/conversores-enums'
import type {
  DevolucionDetalleApi,
  DevolucionListadoApi,
  EstadoDevolucionApi,
} from '@/features/ventas/devoluciones/types/api-devoluciones'

// Guardas de la forma de las respuestas de Devoluciones. Solo miran la forma: que los textos sean numeros validos
// lo decide la conversion, que devuelve null y se trata como respuesta ilegible.

export const esEstadoDevolucionApi = (valor: unknown): valor is EstadoDevolucionApi =>
  valor === 'ACTIVO' || valor === 'ANULADO'

export const esEnteroNoNegativo = (valor: unknown) =>
  typeof valor === 'number' && Number.isInteger(valor) && valor >= 0

const esTextoONulo = (valor: unknown) => valor === null || typeof valor === 'string'
const esNumeroONulo = (valor: unknown) => valor === null || typeof valor === 'number'

const esUsuarioDevolucionApi = (valor: unknown) =>
  esObjeto(valor) && typeof valor.idUsuario === 'number' && typeof valor.nombre === 'string'

export function esDevolucionListadoApi(valor: unknown): valor is DevolucionListadoApi {
  return (
    esObjeto(valor) &&
    typeof valor.idCambio === 'number' &&
    typeof valor.fechaHora === 'string' &&
    esEstadoDevolucionApi(valor.estado) &&
    esTextoONulo(valor.fechaHoraLimiteModificacion) &&
    esNumeroONulo(valor.idVentaOriginal) &&
    esTextoONulo(valor.numeroComprobanteVentaOriginal) &&
    typeof valor.idProductoDevuelto === 'number' &&
    typeof valor.nombreProductoDevuelto === 'string' &&
    esFormatoVentaApi(valor.formatoVentaProductoDevuelto) &&
    typeof valor.cantidadDevuelta === 'string' &&
    typeof valor.esBolsaAbierta === 'boolean' &&
    esTextoONulo(valor.cantidadStockIngresado) &&
    typeof valor.idProductoEntregado === 'number' &&
    typeof valor.nombreProductoEntregado === 'string' &&
    esFormatoVentaApi(valor.formatoVentaProductoEntregado) &&
    typeof valor.cantidadEntregada === 'string' &&
    typeof valor.saldoResultante === 'string' &&
    esNumeroONulo(valor.idMedioPago) &&
    esTextoONulo(valor.nombreMedioPago)
  )
}

function esArticuloDevueltoApi(valor: unknown) {
  return (
    esObjeto(valor) &&
    typeof valor.idProducto === 'number' &&
    typeof valor.nombreProducto === 'string' &&
    esFormatoVentaApi(valor.formatoVenta) &&
    typeof valor.cantidadDevuelta === 'string' &&
    typeof valor.esBolsaAbierta === 'boolean' &&
    typeof valor.precioUnitario === 'string' &&
    typeof valor.subtotal === 'string'
  )
}

function esArticuloEntregadoApi(valor: unknown) {
  return (
    esObjeto(valor) &&
    typeof valor.idProducto === 'number' &&
    typeof valor.nombreProducto === 'string' &&
    esFormatoVentaApi(valor.formatoVenta) &&
    typeof valor.cantidadEntregada === 'string' &&
    typeof valor.precioUnitario === 'string' &&
    typeof valor.subtotal === 'string'
  )
}

function esPagoSaldoApi(valor: unknown) {
  return (
    valor === null ||
    (esObjeto(valor) &&
      typeof valor.idMedioPago === 'number' &&
      typeof valor.nombreMedioPago === 'string' &&
      esTextoONulo(valor.montoRecibido) &&
      esTextoONulo(valor.vuelto))
  )
}

function esAnulacionDevolucionApi(valor: unknown) {
  return (
    valor === null ||
    (esObjeto(valor) &&
      typeof valor.fechaHora === 'string' &&
      typeof valor.motivo === 'string' &&
      esUsuarioDevolucionApi(valor.usuario))
  )
}

export function esDevolucionDetalleApi(valor: unknown): valor is DevolucionDetalleApi {
  return (
    esObjeto(valor) &&
    typeof valor.idCambio === 'number' &&
    typeof valor.fechaHora === 'string' &&
    esEstadoDevolucionApi(valor.estado) &&
    esTextoONulo(valor.fechaHoraLimiteModificacion) &&
    esTextoONulo(valor.motivoCambio) &&
    (valor.ventaVinculada === null ||
      (esObjeto(valor.ventaVinculada) &&
        typeof valor.ventaVinculada.idVenta === 'number' &&
        esTextoONulo(valor.ventaVinculada.numeroComprobante) &&
        // Tolerante: si el back no manda los datos del envio, el detalle sigue sirviendo
        (valor.ventaVinculada.modalidadEntrega === undefined ||
          esModalidadEntregaApi(valor.ventaVinculada.modalidadEntrega)) &&
        (valor.ventaVinculada.direccionEnvio === undefined || esTextoONulo(valor.ventaVinculada.direccionEnvio)) &&
        (valor.ventaVinculada.destinatarioEnvio === undefined ||
          esTextoONulo(valor.ventaVinculada.destinatarioEnvio)))) &&
    esArticuloDevueltoApi(valor.articuloDevuelto) &&
    esObjeto(valor.productoStockIngresado) &&
    typeof valor.productoStockIngresado.idProducto === 'number' &&
    typeof valor.productoStockIngresado.nombreProducto === 'string' &&
    esTextoONulo(valor.productoStockIngresado.cantidadStockIngresado) &&
    esArticuloEntregadoApi(valor.articuloEntregado) &&
    typeof valor.valorDevuelto === 'string' &&
    typeof valor.valorEntregado === 'string' &&
    typeof valor.saldoResultante === 'string' &&
    esPagoSaldoApi(valor.pagoSaldo) &&
    esUsuarioDevolucionApi(valor.vendedor) &&
    esAnulacionDevolucionApi(valor.anulacion)
  )
}
