import { ResumenResultados } from '@/features/ventas/components/resumen-resultados'
import type {
  EstadoListaHistorial,
  PropiedadesFiltrosHistorial,
} from '@/features/ventas/types/historial'
import { construirChipsFiltrosHistorial } from '@/features/ventas/utils/construir-chips-filtros-historial'
import { describirResultados } from '@/features/ventas/utils/describir-resultados-historial'

/** Props del resumen que va entre los filtros y la lista. */
interface ResumenResultadosHistorialProps {
  estadoLista: EstadoListaHistorial
  propiedadesFiltros: PropiedadesFiltrosHistorial
}

/** Resumen del historial: el texto y los chips ya armados para el resumen generico. */
export function ResumenResultadosHistorial({
  estadoLista,
  propiedadesFiltros,
}: ResumenResultadosHistorialProps) {
  return (
    <ResumenResultados
      textoResultados={describirResultados(estadoLista)}
      cantidadFiltrosActivos={propiedadesFiltros.cantidadFiltrosActivos}
      chipsAdicionales={construirChipsFiltrosHistorial(propiedadesFiltros, true)}
      chipsTodos={construirChipsFiltrosHistorial(propiedadesFiltros, false)}
      onLimpiarFiltros={propiedadesFiltros.onLimpiarFiltros}
    />
  )
}
