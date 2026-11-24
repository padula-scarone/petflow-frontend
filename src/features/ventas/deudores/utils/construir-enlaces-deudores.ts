import { formatearFechaHora } from '@/lib/formatear-fecha-hora'
import { formatearMoneda, formatearMonedaConSigno } from '@/lib/formatear-moneda'
import type { ReciboCobroDeudor } from '@/features/ventas/deudores/types/cobro-deudor'
import type { ComprobanteConDeuda } from '@/features/ventas/deudores/types/comprobante-con-deuda'
import { describirFechaEstimada } from '@/features/ventas/deudores/utils/fechas-estimadas'
import { formatearCantidad } from '@/features/ventas/utils/formatear-cantidad'

// Los textos se precargan en WhatsApp o en el mail con deep links, igual que el resto de los comprobantes.

/** Texto del comprobante de una venta con deuda. */
export function construirTextoComprobanteConDeuda(comprobante: ComprobanteConDeuda) {
  const lineasProductos = comprobante.detalles.map(
    (detalle) =>
      `- ${formatearCantidad(detalle.cantidad, detalle.formato)} ${detalle.nombreProducto}: ${formatearMoneda(detalle.subtotal)}`,
  )
  const lineasAjustes = [
    ...(comprobante.descuentoManual
      ? [
          `- Descuento manual (${comprobante.descuentoManual.motivo}): ${formatearMonedaConSigno(-comprobante.descuentoManual.monto)}`,
        ]
      : []),
    ...comprobante.pagos
      .filter((pago) => pago.montoAjuste !== 0)
      .map(
        (pago) =>
          `- ${pago.montoAjuste < 0 ? 'Descuento' : 'Recargo'} ${pago.nombreMedioPago}: ${formatearMonedaConSigno(pago.montoAjuste)}`,
      ),
  ]
  const lineasPagos =
    comprobante.pagos.length > 0
      ? [
          'Pagó ahora:',
          ...comprobante.pagos.map((pago) => `- ${pago.nombreMedioPago}: ${formatearMoneda(pago.montoFinal)}`),
          ...(comprobante.numeroReciboPagoInicial === null ? [] : [`Recibo del pago: ${comprobante.numeroReciboPagoInicial}`]),
        ]
      : []

  return [
    `PetFlow - Comprobante ${comprobante.numeroComprobante}`,
    formatearFechaHora(comprobante.fechaHora),
    '',
    ...lineasProductos,
    ...(lineasAjustes.length > 0 ? ['', 'Descuentos y recargos:', ...lineasAjustes] : []),
    '',
    `IMPORTE DE LA VENTA: ${formatearMoneda(comprobante.importeVenta)}`,
    ...lineasPagos,
    `QUEDA DEBIENDO: ${formatearMoneda(comprobante.montoAdeudado)}`,
    `A nombre de: ${comprobante.deudor.nombreCompleto}`,
    `Fecha estimada de pago: ${describirFechaEstimada(comprobante.fechaEstimadaPago)}`,
  ].join('\n')
}

/** Texto del recibo consolidado de un cobro de fiados. */
export function construirTextoReciboCobro(recibo: Omit<ReciboCobroDeudor, 'enlaceWhatsApp' | 'enlaceMail'>) {
  const lineasFiados = recibo.fiadosAbonados.map((fiado) => {
    const restante =
      fiado.estadoResultante === 'COMPLETADA'
        ? 'completado'
        : `falta ${formatearMoneda(fiado.montoFaltanteResultante)}`
    return `- ${fiado.numeroComprobante}: abonó ${formatearMoneda(fiado.montoAbonado)} (${restante})`
  })
  const lineasPagos = recibo.pagos.map((pago) => `- ${pago.nombreMedioPago}: ${formatearMoneda(pago.montoFinal)}`)

  return [
    `PetFlow - Recibo ${recibo.numeroRecibo}`,
    formatearFechaHora(recibo.fechaHora),
    `Deudor: ${recibo.deudor.nombreCompleto}`,
    '',
    'Fiados abonados:',
    ...lineasFiados,
    '',
    'Medios de pago:',
    ...lineasPagos,
    '',
    `TOTAL COBRADO: ${formatearMoneda(recibo.montoTotalCobrado)}`,
    `Saldo restante: ${formatearMoneda(recibo.saldoRestanteDeudor)}`,
  ].join('\n')
}

/** Enlace wa.me con un texto precargado; sin telefono, WhatsApp abre el selector de contactos. */
export function construirEnlaceWhatsAppConTexto(texto: string) {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`
}

/** Enlace mailto: con el asunto y el texto precargados. */
export function construirEnlaceMailConTexto(asunto: string, texto: string) {
  return `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(texto)}`
}
