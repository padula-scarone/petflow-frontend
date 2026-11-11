import { formatearMoneda, formatearMonedaConSigno } from '@/lib/formatear-moneda'
import { formatearFechaHora } from '@/lib/formatear-fecha-hora'
import { formatearCantidad } from '@/features/ventas/utils/formatear-cantidad'
import type { Comprobante } from '@/features/ventas/types/comprobante'

/** Arma el texto del comprobante que se precarga en el mensaje de WhatsApp o en el mail. */
export function construirTextoComprobante(comprobante: Comprobante) {
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
    ...(comprobante.estado === 'completada'
      ? comprobante.pagos
          .filter((pago) => pago.montoAjuste !== 0)
          .map(
            (pago) =>
              `- ${pago.montoAjuste < 0 ? 'Descuento' : 'Recargo'} ${pago.nombreMedioPago}: ${formatearMonedaConSigno(pago.montoAjuste)}`,
          )
      : []),
  ]
  const lineasPago =
    comprobante.estado === 'completada'
      ? [
          'Medios de pago:',
          ...comprobante.pagos.map(
            (pago) => `- ${pago.nombreMedioPago}: ${formatearMoneda(pago.montoFinal)}`,
          ),
        ]
      : [`Deuda a nombre de ${comprobante.clienteReferencia}: ${formatearMoneda(comprobante.montoTotal)}`]

  return [
    `PetFlow - Comprobante ${comprobante.numeroComprobante}`,
    formatearFechaHora(comprobante.fechaHora),
    '',
    ...lineasProductos,
    ...(lineasAjustes.length > 0 ? ['', 'Descuentos y recargos:', ...lineasAjustes] : []),
    '',
    `TOTAL: ${formatearMoneda(comprobante.montoTotal)}`,
    ...lineasPago,
  ].join('\n')
}

/** Devuelve el enlace wa.me con el comprobante precargado; sin telefono, WhatsApp abre el selector de contactos. */
export function construirEnlaceWhatsApp(comprobante: Comprobante) {
  return `https://wa.me/?text=${encodeURIComponent(construirTextoComprobante(comprobante))}`
}

/** Devuelve el enlace mailto: con el asunto y el comprobante precargados. */
export function construirEnlaceMail(comprobante: Comprobante) {
  const asunto = encodeURIComponent(`PetFlow - Comprobante ${comprobante.numeroComprobante}`)
  const cuerpo = encodeURIComponent(construirTextoComprobante(comprobante))
  return `mailto:?subject=${asunto}&body=${cuerpo}`
}
