import type {
  EstadoListaDevoluciones,
  PropiedadesFiltrosDevoluciones,
} from '@/features/ventas/devoluciones/types/devolucion'
import { construirChipsFiltrosDevoluciones } from '@/features/ventas/devoluciones/utils/construir-chips-filtros-devoluciones'
import { describirResultadosDevoluciones } from '@/features/ventas/devoluciones/utils/describir-resultados-devoluciones'
import { ResumenResultados } from '@/features/ventas/components/resumen-resultados'

/** Props del resumen que va entre los filtros y la lista de devoluciones. */
interface ResumenResultadosDevolucionesProps {
  estadoLista: EstadoListaDevoluciones
  propiedadesFiltros: PropiedadesFiltrosDevoluciones
}

/** Resumen de devoluciones: "Mostrando 1–10 de N devoluciones", "Limpiar filtros" y los chips ya armados. */
export function ResumenResultadosDevoluciones({ estadoLista, propiedadesFiltros }: ResumenResultadosDevolucionesProps) {
  return (
    <ResumenResultados
      textoResultados={describirResultadosDevoluciones(estadoLista)}
      cantidadFiltrosActivos={propiedadesFiltros.cantidadFiltrosActivos}
      chipsAdicionales={construirChipsFiltrosDevoluciones(propiedadesFiltros, true)}
      chipsTodos={construirChipsFiltrosDevoluciones(propiedadesFiltros, false)}
      onLimpiarFiltros={propiedadesFiltros.onLimpiarFiltros}
    />
  )
}
