import { BarraFiltrosHistorial } from '@/features/ventas/components/barra-filtros-historial'
import { CampoFiltroComprobante } from '@/features/ventas/components/campo-filtro-comprobante'
import { HojaFiltrosHistorial } from '@/features/ventas/components/hoja-filtros-historial'
import { PanelFiltros } from '@/features/ventas/components/panel-filtros'
import type { PropiedadesFiltrosHistorial } from '@/features/ventas/types/historial'

/** Props del panel de filtros del historial. */
interface PanelFiltrosHistorialProps {
  propiedades: PropiedadesFiltrosHistorial
}

/** Arma el panel generico con la barra, la hoja y el buscador de comprobante (siempre a la vista en mobile). */
export function PanelFiltrosHistorial({ propiedades }: PanelFiltrosHistorialProps) {
  const { filtros, onCambiarFiltros } = propiedades

  return (
    <PanelFiltros
      busquedaMobile={
        <CampoFiltroComprobante
          idCampo="movil-comprobante"
          numeroComprobante={filtros.numeroComprobante}
          onCambiarNumeroComprobante={(numeroComprobante) => onCambiarFiltros({ numeroComprobante })}
        />
      }
      barra={<BarraFiltrosHistorial propiedades={propiedades} />}
      hoja={<HojaFiltrosHistorial propiedades={propiedades} />}
    />
  )
}
