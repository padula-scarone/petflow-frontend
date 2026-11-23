import { ResumenResultados } from '@/features/ventas/components/resumen-resultados'
import type { ListaDeudoresProps } from '@/features/ventas/deudores/types/cuenta-corriente'
import { construirChipsFiltrosDeudores } from '@/features/ventas/deudores/utils/construir-chips-filtros-deudores'
import { describirResultadosDeudores } from '@/features/ventas/deudores/utils/describir-resultados-deudores'

/** Props del resumen que va entre los filtros y la lista de deudores. */
type ResumenResultadosDeudoresProps = Pick<
  ListaDeudoresProps,
  'filtros' | 'estadoLista' | 'onCambiarProximoPago' | 'onLimpiarFiltros'
>

/** Resumen de deudores: "Mostrando 1–10 de N deudores", "Limpiar filtros" y los chips, como en Historial y Devoluciones. */
export function ResumenResultadosDeudores({
  filtros,
  estadoLista,
  onCambiarProximoPago,
  onLimpiarFiltros,
}: ResumenResultadosDeudoresProps) {
  const cantidadFiltrosActivos = (filtros.busqueda.trim() === '' ? 0 : 1) + (filtros.proximoPago === null ? 0 : 1)

  return (
    <ResumenResultados
      textoResultados={describirResultadosDeudores(estadoLista)}
      cantidadFiltrosActivos={cantidadFiltrosActivos}
      // En escritorio el proximo pago se ve en la barra: no hay nada escondido
      chipsAdicionales={[]}
      chipsTodos={construirChipsFiltrosDeudores(filtros, onCambiarProximoPago)}
      onLimpiarFiltros={onLimpiarFiltros}
    />
  )
}
