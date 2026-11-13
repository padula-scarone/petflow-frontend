import type { FiltrosCambios } from '@/features/ventas/cambios-mercaderia/types/cambio'

/** Filtros de la lista de cambios sin ninguna restriccion. */
export const FILTROS_CAMBIOS_VACIOS: FiltrosCambios = {
  fechaDesde: null,
  fechaHasta: null,
  productoSeleccionado: null,
  estado: null,
  vinculo: null,
  medioPago: null,
}

/** Cuenta los filtros que viven dentro de "Mas filtros": vinculo y medio de pago. */
export function contarFiltrosAdicionalesCambios(filtros: FiltrosCambios) {
  return [filtros.vinculo !== null, filtros.medioPago !== null].filter(Boolean).length
}

/** Cuenta todos los filtros con valor. El rango de fechas cuenta como uno solo. */
export function contarFiltrosActivosCambios(filtros: FiltrosCambios) {
  const condiciones = [
    filtros.fechaDesde !== null || filtros.fechaHasta !== null,
    filtros.productoSeleccionado !== null,
    filtros.estado !== null,
  ]
  return condiciones.filter(Boolean).length + contarFiltrosAdicionalesCambios(filtros)
}
