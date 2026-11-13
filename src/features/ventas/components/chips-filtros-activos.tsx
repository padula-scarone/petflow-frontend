import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ChipFiltro } from '@/features/ventas/types/compartidos'

/** Props de los chips con los filtros aplicados. */
interface ChipsFiltrosActivosProps {
  chips: ChipFiltro[]
  className?: string
}

/** Un chip por filtro aplicado; tocarlo lo quita. Sin filtros no dibuja nada. */
export function ChipsFiltrosActivos({ chips, className }: ChipsFiltrosActivosProps) {
  if (chips.length === 0) return null

  return (
    <ul aria-label="Filtros aplicados" className={cn('flex flex-wrap gap-2', className)}>
      {chips.map((chip) => (
        <li key={chip.clave}>
          <Button
            type="button"
            variant="outline"
            aria-label={`Quitar el filtro de ${chip.descripcion}: ${chip.etiqueta}`}
            className="h-11 max-w-full gap-1.5 rounded-full bg-fondo-seleccion px-4 text-sm"
            onClick={chip.onQuitar}
          >
            <span className="truncate">{chip.etiqueta}</span>
            <X />
          </Button>
        </li>
      ))}
    </ul>
  )
}
