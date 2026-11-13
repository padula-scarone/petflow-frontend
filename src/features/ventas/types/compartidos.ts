import type { LucideIcon } from 'lucide-react'

// Tipos que comparten el Historial de ventas y Cambios posventa.

/** Metadatos de paginacion de cualquier listado. */
export interface PaginacionResultados {
  /** Empieza en 1. */
  pagina: number
  cantidadPorPagina: number
  totalRegistros: number
  totalPaginas: number
}

/** Par de fechas AAAA-MM-DD, inclusivas. Es lo unico que necesita el filtro de rango de fechas. */
export interface RangoFechasFiltro {
  fechaDesde: string | null
  fechaHasta: string | null
}

/** Una opcion de un selector de filtro. */
export interface OpcionSelector<Valor extends string> {
  valor: Valor
  etiqueta: string
}

/** Como se presenta un estado: siempre icono y texto, nunca solo color. */
export interface PresentacionEstado {
  etiqueta: string
  icono: LucideIcon
  claseInsignia: string
}

/** Un filtro aplicado, listo para mostrarse como chip. Cada pantalla arma su lista. */
export interface ChipFiltro {
  clave: string
  etiqueta: string
  /** Para el aria-label: "Quitar el filtro de {descripcion}: {etiqueta}". */
  descripcion: string
  onQuitar: () => void
}
