import { FilterX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResumenFiltrosActivos } from '@/features/ventas/components/resumen-filtros-activos'
import type {
  EstadoListaHistorial,
  PropiedadesFiltrosHistorial,
} from '@/features/ventas/types/historial'
import { describirResultados } from '@/features/ventas/utils/describir-resultados-historial'

/** Props del resumen que va entre los filtros y la lista. */
interface ResumenResultadosHistorialProps {
  estadoLista: EstadoListaHistorial
  propiedadesFiltros: PropiedadesFiltrosHistorial
}

/**
 * Cuantas ventas se ven y que filtros hay aplicados. No es fijo: scrollea junto con la lista.
 * Escritorio: texto, "Limpiar filtros" (solo con filtros activos) y chips de "Mas filtros".
 * Mobile: el conteo y "Limpiar" ya estan en la fila fija; aca quedan solo los chips de lo aplicado.
 */
export function ResumenResultadosHistorial({
  estadoLista,
  propiedadesFiltros,
}: ResumenResultadosHistorialProps) {
  return (
    // Fragmento: cada pieza es hija directa de la seccion, asi lo que no se muestra no deja huecos
    <>
      <div className="hidden min-h-11 items-center justify-between gap-3 lg:flex">
        <p role="status" className="text-sm text-texto-suave tabular-nums">
          {describirResultados(estadoLista)}
        </p>
        {propiedadesFiltros.cantidadFiltrosActivos > 0 && (
          <Button
            type="button"
            variant="ghost"
            className="h-11 shrink-0 gap-1.5 px-3"
            onClick={propiedadesFiltros.onLimpiarFiltros}
          >
            <FilterX />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Escritorio: solo lo escondido en "Mas filtros". Mobile: todo lo aplicado */}
      <ResumenFiltrosActivos
        propiedades={propiedadesFiltros}
        soloAdicionales
        className="hidden lg:flex"
      />
      <ResumenFiltrosActivos
        propiedades={propiedadesFiltros}
        soloAdicionales={false}
        className="lg:hidden"
      />
    </>
  )
}
