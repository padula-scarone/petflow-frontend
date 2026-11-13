import type { RangoFechasFiltro } from '@/features/ventas/types/compartidos'

/**
 * Si las fechas quedaron cruzadas (desde despues de hasta), iguala la que no se acaba de tocar a la que
 * si: asi priorizamos lo que el usuario cambio ultimo.
 */
export function corregirRangoFechas<Filtros extends RangoFechasFiltro>(
  filtros: Filtros,
  cambios: Partial<Filtros>,
): Filtros {
  const { fechaDesde, fechaHasta } = filtros
  if (fechaDesde === null || fechaHasta === null || fechaDesde <= fechaHasta) return filtros
  return 'fechaDesde' in cambios
    ? { ...filtros, fechaHasta: fechaDesde }
    : { ...filtros, fechaDesde: fechaHasta }
}
