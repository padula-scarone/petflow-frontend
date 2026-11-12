import { BarraFiltrosHistorial } from '@/features/ventas/components/barra-filtros-historial'
import { HojaFiltrosHistorial } from '@/features/ventas/components/hoja-filtros-historial'
import type { PropiedadesFiltrosHistorial } from '@/features/ventas/types/historial'

/** Props del panel de filtros del historial. */
interface PanelFiltrosHistorialProps {
  propiedades: PropiedadesFiltrosHistorial
}

/** Escritorio: la barra de una fila. Mobile: un boton que abre la hoja. Ambas se alternan con CSS. */
export function PanelFiltrosHistorial({ propiedades }: PanelFiltrosHistorialProps) {
  return (
    <>
      <div className="hidden lg:block">
        <BarraFiltrosHistorial propiedades={propiedades} />
      </div>
      <div className="lg:hidden">
        <HojaFiltrosHistorial propiedades={propiedades} />
      </div>
    </>
  )
}
