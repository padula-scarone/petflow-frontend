import { SelectorFiltroEntrega } from '@/features/ventas/components/selector-filtro-entrega'
import { SelectorFiltroMedioPago } from '@/features/ventas/components/selector-filtro-medio-pago'
import { SelectorFiltroOrigen } from '@/features/ventas/components/selector-filtro-origen'
import type { PropiedadesFiltrosHistorial } from '@/features/ventas/types/historial'

/** Props de los filtros menos usados: origen, entrega y medio de pago. */
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
    <div className="flex flex-col gap-bloque">
      <SelectorFiltroOrigen
        idPrefijo={idPrefijo}
        origen={filtros.origen}
        onCambiarOrigen={(origen) => onCambiarFiltros({ origen })}
      />
      <SelectorFiltroEntrega
        idPrefijo={idPrefijo}
        modalidadEntrega={filtros.modalidadEntrega}
        onCambiarModalidadEntrega={(modalidadEntrega) => onCambiarFiltros({ modalidadEntrega })}
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
    </div>
  )
}
