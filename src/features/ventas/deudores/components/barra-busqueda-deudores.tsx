import { useId } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { FiltrosDeudores } from '@/features/ventas/deudores/types/cuenta-corriente'

/** Props de la barra con el buscador, el interruptor y el alta. */
interface BarraBusquedaDeudoresProps {
  filtros: FiltrosDeudores
  onCambiarBusqueda: (busqueda: string) => void
  onCambiarIncluirSinDeuda: (incluirSinDeuda: boolean) => void
  onNuevoDeudor: () => void
}

/** Buscador por nombre o DNI, interruptor "Incluir a los que no deben" y boton "Nuevo deudor". */
export function BarraBusquedaDeudores({
  filtros,
  onCambiarBusqueda,
  onCambiarIncluirSinDeuda,
  onNuevoDeudor,
}: BarraBusquedaDeudoresProps) {
  const idBusqueda = useId()

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

      <div className="flex items-center justify-between gap-interno">
        {/* --- INTERRUPTOR: el label entero es el area de toque, de al menos 44 px de alto --- */}
        <Label className="flex min-h-11 cursor-pointer items-center gap-interno text-cuerpo font-medium">
          <Switch checked={filtros.incluirSinDeuda} onCheckedChange={onCambiarIncluirSinDeuda} />
          Incluir a los que no deben
        </Label>

        {/* --- ALTA --- */}
        <Button type="button" onClick={onNuevoDeudor}>
          <Plus aria-hidden="true" />
          Nuevo deudor
        </Button>
      </div>
    </div>
  )
}
