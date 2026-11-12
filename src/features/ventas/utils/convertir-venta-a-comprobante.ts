import type { Comprobante, PagoComprobante } from '@/features/ventas/types/comprobante'
import type { PagoVentaDetalle, VentaDetalle } from '@/features/ventas/types/historial'

/** Pasa un pago del back a la forma que usan los componentes del comprobante. */
function convertirPago(pago: PagoVentaDetalle): PagoComprobante {
  const datosComunes = {
    idMedioPago: pago.idMedioPago,
    nombreMedioPago: pago.nombreMedioPago,
    montoBase: pago.montoBase,
    porcentajeAjuste: pago.porcentajeAplicado,
    montoAjuste: pago.montoFinal - pago.montoBase,
    montoFinal: pago.montoFinal,
  }
  // El back solo informa recibido y vuelto en efectivo
  return pago.montoRecibido !== null && pago.vuelto !== null
    ? { ...datosComunes, admiteVuelto: true, montoRecibido: pago.montoRecibido, vuelto: pago.vuelto }
    : { ...datosComunes, admiteVuelto: false }
}

/**
 * Adapta una venta del back al Comprobante de Registrar Venta, para reutilizar sus componentes
 * y sus enlaces de envio. La forma sale de los pagos: con pagos es cobrada; sin pagos, fiado.
 * El comprobante no tiene estado anulada: la vista de detalle muestra ese caso por su cuenta.
 */
export function convertirVentaAComprobante(venta: VentaDetalle): Comprobante {
  const datosComunes = {
    idVenta: String(venta.idVenta),
    numeroComprobante: venta.numeroComprobante,
    fechaHora: venta.fechaHora,
    canalVenta: venta.origen === 'MOSTRADOR' ? ('mostrador' as const) : ('digital' as const),
    tipoEntrega: venta.modalidadEntrega === 'RETIRO' ? ('retiro' as const) : ('envio' as const),
    nombreVendedor: venta.vendedor.nombre,
    detalles: venta.items.map((item) => ({
      idProducto: String(item.idProducto),
      nombreProducto: item.nombreProducto,
      formato: item.formatoVenta === 'GRANEL' ? ('granel' as const) : ('unidad' as const),
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.subtotal,
    })),
    descuentoManual:
      venta.descuentoManual > 0
        ? {
            motivo: venta.motivoDescuento ?? 'Sin motivo registrado',
            monto: venta.descuentoManual,
          }
        : null,
    subtotalProductos: venta.subtotalBruto,
    montoTotal: venta.montoTotal,
  }

  const [primerPago, ...otrosPagos] = venta.pagos.map(convertirPago)
  if (!primerPago) {
    return {
      ...datosComunes,
      estado: 'pendiente-pago',
      clienteReferencia: venta.clienteReferencia ?? 'Sin cliente',
    }
  }
  return {
    ...datosComunes,
    estado: 'completada',
    clienteReferencia: venta.clienteReferencia,
    pagos: [primerPago, ...otrosPagos],
  }
}
