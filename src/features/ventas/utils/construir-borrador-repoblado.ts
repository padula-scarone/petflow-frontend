import { convertirModalidadAEntrega, convertirOrigenACanal } from '@/features/ventas/api/conversores-enums'
import { MOTIVO_DESCUENTO_NO_REGISTRADO } from '@/features/ventas/config/reglas-venta'
import type { BorradorRepoblado } from '@/features/ventas/types/borrador-repoblado'
import type { VentaDetalle } from '@/features/ventas/types/historial'

/**
 * Arma lo que viaja a Registrar Venta cuando se edita una venta: sus items, origen, modalidad, cliente,
 * descuento manual y pagos. Los precios no viajan: el carrito toma los vigentes del catalogo.
 */
export function construirBorradorRepoblado(venta: VentaDetalle): BorradorRepoblado {
  return {
    canalVenta: convertirOrigenACanal(venta.origen),
    tipoEntrega: convertirModalidadAEntrega(venta.modalidadEntrega),
    clienteReferencia: venta.clienteReferencia,
    items: venta.items.map((item) => ({
      idProducto: String(item.idProducto),
      nombreProducto: item.nombreProducto,
      cantidad: item.cantidad,
    })),
    descuentoManual:
      venta.descuentoManual > 0
        ? {
            monto: venta.descuentoManual,
            motivo: venta.motivoDescuento ?? MOTIVO_DESCUENTO_NO_REGISTRADO,
          }
        : null,
    pagos: venta.pagos.map((pago) => ({
      idMedioPago: pago.idMedioPago,
      nombreMedioPago: pago.nombreMedioPago,
      montoBase: pago.montoBase,
      // El monto recibido solo existe en efectivo
      montoRecibido: pago.admiteVuelto ? pago.montoRecibido : null,
    })),
  }
}
