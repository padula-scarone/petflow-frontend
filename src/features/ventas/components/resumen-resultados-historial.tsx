import { FilterX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResumenFiltrosActivos } from '@/features/ventas/components/resumen-filtros-activos'
import type {
  EstadoListaHistorial,
  PropiedadesFiltrosHistorial,
} from '@/features/ventas/types/historial'

/** Props del resumen que va entre los filtros y la lista. */
interface ResumenResultadosHistorialProps {
  estadoLista: EstadoListaHistorial
  propiedadesFiltros: PropiedadesFiltrosHistorial
}

function describirResultados(estadoLista: EstadoListaHistorial) {
  if (estadoLista.tipo === 'cargando') return 'Cargando…'
  if (estadoLista.tipo === 'sin-resultados') return '0 ventas'
  if (estadoLista.tipo !== 'con-ventas') return ''
  const { filas, paginacion } = estadoLista
  const primera = (paginacion.pagina - 1) * paginacion.cantidadPorPagina + 1
  return `Mostrando ${primera}–${primera + filas.length - 1} de ${paginacion.totalRegistros} ventas`
}

/**
 * Cuantas ventas se ven y que filtros hay aplicados. "Limpiar filtros" vive aca y aparece solo
 * cuando hay algun filtro activo. No es fijo: scrollea junto con la lista.
 */
export function ResumenResultadosHistorial({
  estadoLista,
  propiedadesFiltros,
}: ResumenResultadosHistorialProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-11 items-center justify-between gap-3">
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
      <div className="hidden lg:block">
        <ResumenFiltrosActivos propiedades={propiedadesFiltros} soloAdicionales />
      </div>
      <div className="lg:hidden">
        <ResumenFiltrosActivos propiedades={propiedadesFiltros} soloAdicionales={false} />
      </div>
    </div>
  )
}
