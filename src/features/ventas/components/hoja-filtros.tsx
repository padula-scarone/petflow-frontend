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

/**
 * Mobile: un boton que abre una hoja con los filtros que no estan a la vista, cada uno con su etiqueta. Por debajo de sm
 * el boton es solo el icono (con la insignia al lado) para que el buscador de la fila tenga lugar; desde sm lleva
 * tambien el texto. La insignia no se superpone al icono: sobresalir por arriba la tapaba la barra de pestañas.
 */
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
        <Button
          type="button"
          variant="outline"
          className="shrink-0 gap-2 bg-fondo-tarjeta max-sm:min-w-control max-sm:px-2"
        >
          <SlidersHorizontal />
          {/* sr-only por debajo de sm: el icono solo no se anuncia */}
          <span className="max-sm:sr-only">Filtros</span>
          {cantidadFiltrosActivos > 0 && (
            <Badge className="size-6 justify-center rounded-full p-0 tabular-nums">
              <span className="sr-only">Activos: </span>
              {cantidadFiltrosActivos}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        // Sin esto el foco cae en el primer campo, que puede ser un buscador, y en un celular abre el teclado
        onOpenAutoFocus={(evento) => {
          evento.preventDefault()
          if (evento.currentTarget instanceof HTMLElement) evento.currentTarget.focus()
        }}
      >
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>Los resultados se actualizan al elegir cada filtro.</SheetDescription>
        </SheetHeader>
        <SheetBody>{children}</SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" size="lg" className="tabular-nums">
              {totalResultados === null
                ? 'Ver resultados'
                : `Ver ${totalResultados} ${totalResultados === 1 ? sustantivoSingular : sustantivoPlural}`}
            </Button>
          </SheetClose>
          {/* Solo cuando hay algo que limpiar */}
          {cantidadFiltrosActivos > 0 && (
            <Button type="button" variant="ghost" className="gap-2" onClick={onLimpiarFiltros}>
              <FilterX />
              Limpiar filtros
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
