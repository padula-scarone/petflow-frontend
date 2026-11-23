import type { PaginacionResultados } from '@/features/ventas/types/compartidos'

/** "Mostrando 1–10 de 47 ventas": el rango que se ve en la pagina actual. Con uno solo, "Mostrando 1 de 1 venta". */
export function describirRangoMostrado(
  paginacion: PaginacionResultados,
  cantidadFilas: number,
  sustantivoSingular: string,
  sustantivoPlural: string,
) {
  if (paginacion.totalRegistros === 1) return `Mostrando 1 de 1 ${sustantivoSingular}`
  const primera = (paginacion.pagina - 1) * paginacion.cantidadPorPagina + 1
  return `Mostrando ${primera}–${primera + cantidadFilas - 1} de ${paginacion.totalRegistros} ${sustantivoPlural}`
}
