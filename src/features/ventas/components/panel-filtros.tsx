import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

/** Props del panel de filtros de una lista. */
interface PanelFiltrosProps {
  /** Barra de escritorio. */
  barra: ReactNode
  /** Boton que abre la hoja de filtros de mobile. */
  hoja: ReactNode
  /** Texto corto de la fila mobile, por ejemplo "47 ventas". */
  textoCantidad: string
  cantidadFiltrosActivos: number
  onLimpiarFiltros: () => void
  /** Boton principal de la lista (ej. "Cargar nuevo cambio") junto a la barra de escritorio. */
  accionEscritorio?: ReactNode
  /** Version compacta de ese boton para la fila mobile. */
  accionMobile?: ReactNode
}

/**
 * Escritorio: la barra de una fila (y la accion principal a su lado). Mobile: una fila compacta con
 * el boton "Filtros" (que abre la hoja), la cantidad de resultados, "Limpiar" y la accion principal.
 * Ambas se alternan con CSS.
 */
export function PanelFiltros({
  barra,
  hoja,
  textoCantidad,
  cantidadFiltrosActivos,
  onLimpiarFiltros,
  accionEscritorio,
  accionMobile,
}: PanelFiltrosProps) {
  return (
    <>
      <div className="hidden items-start gap-3 lg:flex">
        <div className="min-w-0 flex-1">{barra}</div>
        {/* La linea separa la accion principal de los filtros: no es un filtro mas */}
        {accionEscritorio && <div className="flex shrink-0 border-l pl-3">{accionEscritorio}</div>}
      </div>

      {/* --- MOBILE: UNA SOLA FILA, SIN BOTON DE ANCHO COMPLETO --- */}
      <div className="flex items-center gap-2 lg:hidden">
        {hoja}
        <p
          role="status"
          className="min-w-0 flex-1 truncate text-right text-sm text-texto-suave tabular-nums"
        >
          {textoCantidad}
        </p>
        {cantidadFiltrosActivos > 0 && (
          <Button
            type="button"
            variant="ghost"
            aria-label="Limpiar filtros"
            className="h-11 shrink-0 px-3"
            onClick={onLimpiarFiltros}
          >
            Limpiar
          </Button>
        )}
        {accionMobile && <div className="flex shrink-0 border-l pl-2">{accionMobile}</div>}
      </div>
    </>
  )
}
