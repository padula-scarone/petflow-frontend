import type { ReactNode } from 'react'

/** Props del panel de filtros de una lista. */
interface PanelFiltrosProps {
  /** Buscador principal de la fila de mobile: siempre a la vista, junto al boton de filtros. */
  busquedaMobile: ReactNode
  /** Barra de escritorio, con todos los controles. */
  barra: ReactNode
  /** Boton que abre la hoja de filtros de mobile. */
  hoja: ReactNode
  /** Boton principal de la lista (ej. "Cargar nueva devolución") junto a la barra de escritorio. */
  accionEscritorio?: ReactNode
  /** Version compacta de ese boton para la fila mobile. */
  accionMobile?: ReactNode
}

/**
 * Historial, Devoluciones y Deudores comparten esta estructura, siempre en una sola fila.
 * Escritorio: la barra con todos los controles (y la accion principal a su lado). Mobile: el buscador principal, el
 * boton de filtros (que abre la hoja, donde estan el resto de los filtros y "Limpiar filtros") y la accion principal.
 * Ambas se alternan con CSS.
 */
export function PanelFiltros({ busquedaMobile, barra, hoja, accionEscritorio, accionMobile }: PanelFiltrosProps) {
  return (
    <>
      <div className="hidden items-start gap-interno lg:flex">
        <div className="min-w-0 flex-1">{barra}</div>
        {/* La linea separa la accion principal de los filtros: no es un filtro mas */}
        {accionEscritorio && <div className="flex shrink-0 border-l pl-3">{accionEscritorio}</div>}
      </div>

      {/* --- MOBILE: UNA SOLA FILA --- */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="min-w-0 flex-1">{busquedaMobile}</div>
        {hoja}
        {accionMobile && <div className="flex shrink-0 border-l pl-2">{accionMobile}</div>}
      </div>
    </>
  )
}
