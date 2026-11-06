import type { MedioPago } from '@/features/ventas/types/cobro'

/** Resume el ajuste automatico de un medio de pago, por ejemplo "−10 %" o "Sin cambios". */
export function describirAjusteMedio(medio: MedioPago) {
  if (medio.tipoAjuste === 'descuento') return `−${medio.porcentajeAjuste} %`
  if (medio.tipoAjuste === 'recargo') return `+${medio.porcentajeAjuste} %`
  return 'Sin cambios'
}
