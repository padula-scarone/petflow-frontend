import { BarraFiltrosHistorial } from '@/features/ventas/components/barra-filtros-historial'
import { HojaFiltrosHistorial } from '@/features/ventas/components/hoja-filtros-historial'
import { PanelFiltros } from '@/features/ventas/components/panel-filtros'
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

/** Arma el panel generico con la barra y la hoja del historial. */
export function PanelFiltrosHistorial({ propiedades, estadoLista }: PanelFiltrosHistorialProps) {
  return (
    <PanelFiltros
      barra={<BarraFiltrosHistorial propiedades={propiedades} />}
      hoja={<HojaFiltrosHistorial propiedades={propiedades} />}
      textoCantidad={describirCantidadVentas(estadoLista)}
      cantidadFiltrosActivos={propiedades.cantidadFiltrosActivos}
      onLimpiarFiltros={propiedades.onLimpiarFiltros}
    />
  )
}
