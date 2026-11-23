import { useId } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FiltroProximoPago } from '@/features/ventas/deudores/components/filtro-proximo-pago'
import { SelectorOrdenDeudores } from '@/features/ventas/deudores/components/selector-orden-deudores'
import type { FiltrosDeudores, ListaDeudoresProps } from '@/features/ventas/deudores/types/cuenta-corriente'

/** Props de la barra con el buscador, el filtro por proximo pago y el orden. */
interface BarraBusquedaDeudoresProps
  extends Pick<ListaDeudoresProps, 'onCambiarBusqueda' | 'onCambiarProximoPago' | 'onCambiarOrden' | 'onInvertirSentido'> {
  filtros: FiltrosDeudores
}

/**
 * Buscador por nombre o DNI, filtro por proximo pago y orden. No hay alta de deudores: un deudor nace al fiarle
 * una venta en Registrar Venta. Quien ya no debe nada sale de la lista y solo aparece al buscarlo.
 */
export function BarraBusquedaDeudores({
  filtros,
  onCambiarBusqueda,
  onCambiarProximoPago,
  onCambiarOrden,
  onInvertirSentido,
}: BarraBusquedaDeudoresProps) {
  const idBusqueda = useId()
  const idProximoPago = useId()

  return (
    <div className="flex flex-col gap-interno xl:flex-row xl:items-center">
      {/* --- BUSCADOR --- */}
      <div className="relative flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-texto-suave"
        />
        <Input
          id={idBusqueda}
          type="text"
          autoComplete="off"
          aria-label="Buscar deudor por nombre o DNI"
          placeholder="Buscar por nombre o DNI"
          className="bg-fondo-tarjeta pl-10"
          value={filtros.busqueda}
          onChange={(evento) => onCambiarBusqueda(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === 'Escape' && filtros.busqueda !== '') {
              evento.stopPropagation()
              onCambiarBusqueda('')
            }
          }}
        />
      </div>

      {/* --- PROXIMO PAGO Y ORDEN --- */}
      <div className="flex flex-col gap-interno sm:flex-row">
        <div className="sm:w-48">
          <FiltroProximoPago
            idCampo={idProximoPago}
            proximoPago={filtros.proximoPago}
            onCambiarProximoPago={onCambiarProximoPago}
          />
        </div>
        <SelectorOrdenDeudores
          ordenarPor={filtros.ordenarPor}
          sentido={filtros.sentido}
          onCambiarOrden={onCambiarOrden}
          onInvertirSentido={onInvertirSentido}
        />
      </div>
    </div>
  )
}
