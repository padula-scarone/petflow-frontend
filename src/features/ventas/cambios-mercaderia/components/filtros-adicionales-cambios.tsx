import { FiltroVinculoCambio } from '@/features/ventas/cambios-mercaderia/components/filtros-selectores-cambios'
import type { PropiedadesFiltrosCambios } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { SelectorFiltroMedioPago } from '@/features/ventas/components/selector-filtro-medio-pago'

/** Props de los filtros menos usados de la lista de cambios. */
interface FiltrosAdicionalesCambiosProps {
  propiedades: PropiedadesFiltrosCambios
  /** Prefijo de los ids: el popover de escritorio y la hoja mobile pueden coexistir en el DOM. */
  idPrefijo: string
}

/** Vinculo con una venta y medio de pago del saldo. Cada control lleva su propia etiqueta. */
export function FiltrosAdicionalesCambios({ propiedades, idPrefijo }: FiltrosAdicionalesCambiosProps) {
  const { filtros, opciones, onCambiarFiltros } = propiedades

  return (
    <div className="flex flex-col gap-4">
      <FiltroVinculoCambio
        idCampo={`${idPrefijo}-vinculo`}
        vinculo={filtros.vinculo}
        onCambiarVinculo={(vinculo) => onCambiarFiltros({ vinculo })}
      />
      {/* Un cambio cobra su saldo con un solo medio: no existe "Mixto" */}
      <SelectorFiltroMedioPago
        idPrefijo={idPrefijo}
        medioPago={filtros.medioPago}
        medios={opciones.mediosPago}
        permiteMixto={false}
        onCambiarMedioPago={(medioPago) =>
          onCambiarFiltros({ medioPago: typeof medioPago === 'number' ? medioPago : null })
        }
      />
    </div>
  )
}
