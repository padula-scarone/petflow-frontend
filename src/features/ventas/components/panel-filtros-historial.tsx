import { Button } from '@/components/ui/button'
import { BarraFiltrosHistorial } from '@/features/ventas/components/barra-filtros-historial'
import { HojaFiltrosHistorial } from '@/features/ventas/components/hoja-filtros-historial'
import type {
  EstadoListaHistorial,
  PropiedadesFiltrosHistorial,
} from '@/features/ventas/types/historial'
import { describirCantidadVentas } from '@/features/ventas/utils/describir-resultados-historial'

/** Props del panel de filtros del historial. */
interface PanelFiltrosHistorialProps {
  propiedades: PropiedadesFiltrosHistorial
  /** Para el conteo de la fila fija de mobile. */
  estadoLista: EstadoListaHistorial
}

/**
 * Escritorio: la barra de una fila. Mobile: una fila compacta con el boton "Filtros" (que abre la
 * hoja), la cantidad de ventas y "Limpiar". Ambas se alternan con CSS.
 */
export function PanelFiltrosHistorial({ propiedades, estadoLista }: PanelFiltrosHistorialProps) {
  return (
    <>
      <div className="hidden lg:block">
        <BarraFiltrosHistorial propiedades={propiedades} />
      </div>

      {/* --- MOBILE: UNA SOLA FILA, SIN BOTON DE ANCHO COMPLETO --- */}
      <div className="flex items-center gap-2 lg:hidden">
        <HojaFiltrosHistorial propiedades={propiedades} />
        <p
          role="status"
          className="min-w-0 flex-1 truncate text-right text-sm text-texto-suave tabular-nums"
        >
          {describirCantidadVentas(estadoLista)}
        </p>
        {propiedades.cantidadFiltrosActivos > 0 && (
          <Button
            type="button"
            variant="ghost"
            aria-label="Limpiar filtros"
            className="h-11 shrink-0 px-3"
            onClick={propiedades.onLimpiarFiltros}
          >
            Limpiar
          </Button>
        )}
      </div>
    </>
  )
}
