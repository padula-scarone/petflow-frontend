import type {
  EstadoListaCambios,
  PropiedadesFiltrosCambios,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import { construirChipsFiltrosCambios } from '@/features/ventas/cambios-mercaderia/utils/construir-chips-filtros-cambios'
import { describirResultadosCambios } from '@/features/ventas/cambios-mercaderia/utils/describir-resultados-cambios'
import { ResumenResultados } from '@/features/ventas/components/resumen-resultados'

/** Props del resumen que va entre los filtros y la lista de cambios. */
interface ResumenResultadosCambiosProps {
  estadoLista: EstadoListaCambios
  propiedadesFiltros: PropiedadesFiltrosCambios
}

/** Resumen de cambios: "Mostrando 1–10 de N cambios", "Limpiar filtros" y los chips ya armados. */
export function ResumenResultadosCambios({ estadoLista, propiedadesFiltros }: ResumenResultadosCambiosProps) {
  return (
    <ResumenResultados
      textoResultados={describirResultadosCambios(estadoLista)}
      cantidadFiltrosActivos={propiedadesFiltros.cantidadFiltrosActivos}
      chipsAdicionales={construirChipsFiltrosCambios(propiedadesFiltros, true)}
      chipsTodos={construirChipsFiltrosCambios(propiedadesFiltros, false)}
      onLimpiarFiltros={propiedadesFiltros.onLimpiarFiltros}
    />
  )
}
