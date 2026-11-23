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

/**
 * Cuenta los filtros que viven dentro de la hoja de mobile: todos menos el producto, que esta siempre a la vista en
 * su buscador. El rango de fechas cuenta como uno solo.
 */
export function contarFiltrosEnHojaDevoluciones(filtros: FiltrosDevoluciones) {
  const condiciones = [filtros.fechaDesde !== null || filtros.fechaHasta !== null, filtros.estado !== null]
  return condiciones.filter(Boolean).length + contarFiltrosAdicionalesDevoluciones(filtros)
}

/** Cuenta todos los filtros con valor, tambien el producto. */
export function contarFiltrosActivosDevoluciones(filtros: FiltrosDevoluciones) {
  return contarFiltrosEnHojaDevoluciones(filtros) + (filtros.productoSeleccionado !== null ? 1 : 0)
}
