import { Card } from '@/components/ui/card'
import { BuscadorDeudor } from '@/features/ventas/deudores/components/buscador-deudor'
import { SelectorFechaEstimada } from '@/features/ventas/deudores/components/selector-fecha-estimada'
import { TarjetaDeudorElegido } from '@/features/ventas/deudores/components/tarjeta-deudor-elegido'
import type { EstadoDeuda, PropiedadesPagoConDeuda } from '@/features/ventas/deudores/types/pago-con-deuda'

/** Props del bloque "Deuda": quien debe y para cuando. */
interface BloqueDeudaProps
  extends Pick<
    PropiedadesPagoConDeuda,
    | 'onBuscarDeudor'
    | 'onReintentarBusquedaDeudor'
    | 'onSeleccionarDeudor'
    | 'onCambiarDeudor'
    | 'onCambiarFechaEstimada'
  > {
  deuda: EstadoDeuda
  onNuevoDeudor: () => void
}

/**
 * Aparece solo cuando queda algo sin pagar: pide a quien se le fia y para cuando. Si el vendedor despues cubre el
 * total, el bloque desaparece y el deudor no se envia con la venta.
 */
export function BloqueDeuda({
  deuda,
  onBuscarDeudor,
  onReintentarBusquedaDeudor,
  onSeleccionarDeudor,
  onCambiarDeudor,
  onCambiarFechaEstimada,
  onNuevoDeudor,
}: BloqueDeudaProps) {
  return (
    <Card className="gap-bloque p-contorno">
      <h2 className="text-titulo-seccion font-bold">Deuda</h2>

      {/* --- DEUDOR --- */}
      {deuda.deudorElegido ? (
        <TarjetaDeudorElegido
          deudor={deuda.deudorElegido}
          avisoDniExistente={deuda.avisoDniExistente}
          onCambiarDeudor={onCambiarDeudor}
        />
      ) : (
        <BuscadorDeudor
          textoBusqueda={deuda.textoBusqueda}
          estadoBusqueda={deuda.estadoBusqueda}
          onBuscarDeudor={onBuscarDeudor}
          onReintentarBusqueda={onReintentarBusquedaDeudor}
          onSeleccionarDeudor={onSeleccionarDeudor}
          onNuevoDeudor={onNuevoDeudor}
        />
      )}

      {/* --- FECHA ESTIMADA --- */}
      <SelectorFechaEstimada fechaEstimada={deuda.fechaEstimada} onCambiarFechaEstimada={onCambiarFechaEstimada} />
    </Card>
  )
}
