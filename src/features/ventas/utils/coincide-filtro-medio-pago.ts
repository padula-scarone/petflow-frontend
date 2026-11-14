import type { FiltroMedioPago, VentaDetalle } from '@/features/ventas/types/historial'

/**
 * Si una venta cumple el filtro por medio de pago. "Mixto" trae las ventas con 2 o mas pagos; un medio
 * puntual trae solo las pagadas unicamente con ese medio. Una venta mixta se ve como "Mixto" en la lista,
 * asi que no aparece dentro de un medio puntual: se la busca con "Mixto".
 */
export function coincideFiltroMedioPago(pagos: VentaDetalle['pagos'], filtro: FiltroMedioPago) {
  if (filtro === null) return true
  if (filtro === 'MIXTO') return pagos.length >= 2
  return pagos.length === 1 && pagos[0].idMedioPago === filtro
}
