import { CampoFiltroComprobante } from '@/features/ventas/components/campo-filtro-comprobante'
import { SelectorFiltroMedioPago } from '@/features/ventas/components/selector-filtro-medio-pago'
import { SelectorFiltroOrigen } from '@/features/ventas/components/selector-filtro-origen'
import type { PropiedadesFiltrosHistorial } from '@/features/ventas/types/historial'

/** Props de los filtros menos usados: origen, medio de pago y numero de comprobante. */
interface FiltrosAdicionalesHistorialProps {
  propiedades: PropiedadesFiltrosHistorial
  /** Prefijo de los ids: el popover de escritorio y la hoja mobile pueden coexistir en el DOM. */
  idPrefijo: string
}

/** Cada control lleva su propia etiqueta. Viven en "Mas filtros" (escritorio) y en la hoja (mobile). */
export function FiltrosAdicionalesHistorial({
  propiedades,
  idPrefijo,
}: FiltrosAdicionalesHistorialProps) {
  const { filtros, opciones, onCambiarFiltros } = propiedades

  return (
    <div className="flex flex-col gap-4">
      <SelectorFiltroOrigen
        idPrefijo={idPrefijo}
        origen={filtros.origen}
        onCambiarOrigen={(origen) => onCambiarFiltros({ origen })}
      />
      {/* Con "Pendiente de pago" queda deshabilitado: un fiado todavia no tiene pagos que filtrar */}
      <SelectorFiltroMedioPago
        idPrefijo={idPrefijo}
        medioPago={filtros.medioPago}
        medios={opciones.mediosPago}
        permiteMixto
        deshabilitado={filtros.estado === 'PENDIENTE_PAGO'}
        textoAyuda="Los fiados todavía no tienen pagos."
        onCambiarMedioPago={(medioPago) => onCambiarFiltros({ medioPago })}
      />
      <CampoFiltroComprobante
        idCampo={`${idPrefijo}-comprobante`}
        numeroComprobante={filtros.numeroComprobante}
        onCambiarNumeroComprobante={(numeroComprobante) => onCambiarFiltros({ numeroComprobante })}
      />
    </div>
  )
}
