import type { ReactNode } from 'react'
import { FilterX, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

/** Props de la hoja de filtros de mobile. */
interface HojaFiltrosProps {
  /** Todos los controles, con variante "hoja" (cada uno con su etiqueta). */
  children: ReactNode
  cantidadFiltrosActivos: number
  /** Total de la ultima consulta, para el boton "Ver n ...". */
  totalResultados: number | null
  sustantivoSingular: string
  sustantivoPlural: string
  onLimpiarFiltros: () => void
}

/** Mobile: un boton que abre una hoja con todos los filtros, cada uno con su etiqueta. */
export function HojaFiltros({
  children,
  cantidadFiltrosActivos,
  totalResultados,
  sustantivoSingular,
  sustantivoPlural,
  onLimpiarFiltros,
}: HojaFiltrosProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="h-11 shrink-0 gap-2 bg-fondo-tarjeta px-4">
          <SlidersHorizontal />
          Filtros
          {cantidadFiltrosActivos > 0 && (
            <Badge className="size-6 justify-center rounded-full p-0 tabular-nums">
              <span className="sr-only">Activos: </span>
              {cantidadFiltrosActivos}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>Los resultados se actualizan al elegir cada filtro.</SheetDescription>
        </SheetHeader>
        <SheetBody>{children}</SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" className="h-12 text-base font-bold tabular-nums">
              {totalResultados === null
                ? 'Ver resultados'
                : `Ver ${totalResultados} ${totalResultados === 1 ? sustantivoSingular : sustantivoPlural}`}
            </Button>
          </SheetClose>
          {/* Solo cuando hay algo que limpiar */}
          {cantidadFiltrosActivos > 0 && (
            <Button type="button" variant="ghost" className="h-11 gap-2" onClick={onLimpiarFiltros}>
              <FilterX />
              Limpiar filtros
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
