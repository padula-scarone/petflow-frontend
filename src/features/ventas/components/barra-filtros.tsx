import type { ReactNode } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

/** Props de la barra de filtros de escritorio. */
interface BarraFiltrosProps {
  /** Los controles principales (fecha, producto, estado...), ya armados con variante "barra". */
  children: ReactNode
  /** Contenido del popover "Mas filtros". */
  contenidoAdicional: ReactNode
  cantidadFiltrosAdicionales: number
}

/**
 * Una sola fila de controles de la misma altura y, al final, "Mas filtros". Sin etiquetas visibles:
 * cada control se entiende por su valor o su placeholder y lleva su aria-label.
 */
export function BarraFiltros({
  children,
  contenidoAdicional,
  cantidadFiltrosAdicionales,
}: BarraFiltrosProps) {
  return (
    // auto-fit: los controles se reparten parejos y, si no entran, bajan alineados por columna
    <div className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-3">
      {children}

      {/* --- MAS FILTROS --- */}
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="h-11 w-full gap-2 bg-fondo-tarjeta">
            <SlidersHorizontal />
            Más filtros
            {cantidadFiltrosAdicionales > 0 && (
              <Badge className="size-6 justify-center rounded-full p-0 tabular-nums">
                <span className="sr-only">Activos: </span>
                {cantidadFiltrosAdicionales}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-4">
          {contenidoAdicional}
        </PopoverContent>
      </Popover>
    </div>
  )
}
