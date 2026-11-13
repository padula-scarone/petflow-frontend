import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { OrigenVenta } from '@/features/ventas/types/historial'

const CLASE_OPCION = 'h-11 rounded-mediano border bg-fondo-tarjeta px-2 text-sm'

/** Props del filtro por origen de la venta. */
interface SelectorFiltroOrigenProps {
  /** Prefijo de ids: la barra y la hoja pueden coexistir en el DOM. */
  idPrefijo: string
  origen: OrigenVenta | null
  onCambiarOrigen: (origen: OrigenVenta | null) => void
}

/** Origen de la venta: Todos, Mostrador o Digital. Lleva su propia etiqueta. */
export function SelectorFiltroOrigen({ idPrefijo, origen, onCambiarOrigen }: SelectorFiltroOrigenProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span id={`${idPrefijo}-origen`} className="text-sm font-medium">
        Origen
      </span>
      <ToggleGroup
        type="single"
        spacing={2}
        aria-labelledby={`${idPrefijo}-origen`}
        className="grid w-full grid-cols-3"
        value={origen ?? 'TODOS'}
        // Radix emite '' al des-seleccionar: se ignora, siempre hay una opcion elegida
        onValueChange={(valor) => {
          if (valor) onCambiarOrigen(valor === 'TODOS' ? null : (valor as OrigenVenta))
        }}
      >
        <ToggleGroupItem value="TODOS" className={CLASE_OPCION}>
          Todos
        </ToggleGroupItem>
        <ToggleGroupItem value="MOSTRADOR" className={CLASE_OPCION}>
          Mostrador
        </ToggleGroupItem>
        <ToggleGroupItem value="DIGITAL" className={CLASE_OPCION}>
          Digital
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
