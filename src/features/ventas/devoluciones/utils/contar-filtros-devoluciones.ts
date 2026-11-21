import type { FiltrosDevoluciones } from '@/features/ventas/devoluciones/types/devolucion'

/** Filtros de la lista de devoluciones sin ninguna restriccion. */
export const FILTROS_DEVOLUCIONES_VACIAS: FiltrosDevoluciones = {
  fechaDesde: null,
  fechaHasta: null,
  productoSeleccionado: null,
  estado: null,
  vinculo: null,
  medioPago: null,
}

/** Cuenta los filtros que viven dentro de "Mas filtros": vinculo y medio de pago. */
export function contarFiltrosAdicionalesDevoluciones(filtros: FiltrosDevoluciones) {
  return [filtros.vinculo !== null, filtros.medioPago !== null].filter(Boolean).length
}

/** Cuenta todos los filtros con valor. El rango de fechas cuenta como uno solo. */
export function contarFiltrosActivosDevoluciones(filtros: FiltrosDevoluciones) {
  const condiciones = [
    filtros.fechaDesde !== null || filtros.fechaHasta !== null,
    filtros.productoSeleccionado !== null,
    filtros.estado !== null,
  ]
  return condiciones.filter(Boolean).length + contarFiltrosAdicionalesDevoluciones(filtros)
}
