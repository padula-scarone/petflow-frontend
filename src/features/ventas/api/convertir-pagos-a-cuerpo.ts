import type { PagoRequest } from '@/features/ventas/types/api-ventas'
import type { PagoSolicitud } from '@/features/ventas/types/solicitud-venta'
import { convertirCentavosAPesos } from '@/features/ventas/utils/calcular-centavos'

/**
 * Pasa los pagos del cobro (centavos) al body del back (pesos). Lo comparten el alta de una venta y el cobro de un
 * fiado. Omite `montoRecibido` cuando no hay: el back lo rechaza si el medio no es efectivo.
 */
export function convertirPagosACuerpo(pagos: PagoSolicitud[]): PagoRequest[] {
  return pagos.map((pago) => ({
    idMedioPago: pago.idMedioPago,
    monto: convertirCentavosAPesos(pago.montoBaseCentavos),
    ...(pago.montoRecibidoCentavos !== null && {
      montoRecibido: convertirCentavosAPesos(pago.montoRecibidoCentavos),
    }),
  }))
}
