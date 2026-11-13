import { FilterX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChipsFiltrosActivos } from '@/features/ventas/components/chips-filtros-activos'
import type { ChipFiltro } from '@/features/ventas/types/compartidos'

/** Props del resumen que va entre los filtros y la lista. */
interface ResumenResultadosProps {
  /** Por ejemplo "Mostrando 1-10 de 47 cambios". */
  textoResultados: string
  cantidadFiltrosActivos: number
  /** Escritorio: solo lo escondido en "Mas filtros". */
  chipsAdicionales: ChipFiltro[]
  /** Mobile: todo lo aplicado, porque la hoja de filtros esta cerrada. */
  chipsTodos: ChipFiltro[]
  onLimpiarFiltros: () => void
}

/**
 * Cuantos resultados se ven y que filtros hay aplicados. No es fijo: scrollea junto con la lista.
 * Escritorio: texto, "Limpiar filtros" (solo con filtros activos) y chips de "Mas filtros".
 * Mobile: el conteo y "Limpiar" ya estan en la fila fija; aca quedan solo los chips de lo aplicado.
 */
export function ResumenResultados({
  textoResultados,
  cantidadFiltrosActivos,
  chipsAdicionales,
  chipsTodos,
  onLimpiarFiltros,
}: ResumenResultadosProps) {
  return (
    // Fragmento: cada pieza es hija directa de la seccion, asi lo que no se muestra no deja huecos
    <>
      <div className="hidden min-h-11 items-center justify-between gap-3 lg:flex">
        <p role="status" className="text-sm text-texto-suave tabular-nums">
          {textoResultados}
        </p>
        {cantidadFiltrosActivos > 0 && (
          <Button
            type="button"
            variant="ghost"
            className="h-11 shrink-0 gap-1.5 px-3"
            onClick={onLimpiarFiltros}
          >
            <FilterX />
            Limpiar filtros
          </Button>
        )}
      </div>

      <ChipsFiltrosActivos chips={chipsAdicionales} className="hidden lg:flex" />
      <ChipsFiltrosActivos chips={chipsTodos} className="lg:hidden" />
    </>
  )
}
