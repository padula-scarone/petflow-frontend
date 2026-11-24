import { HistorialVentas } from '@/features/ventas/components/historial-ventas'
import { useHistorialVentas } from '@/features/ventas/hooks/use-historial-ventas'

/** Ruta de Ventas > Historial: conecta el hook con la vista. */
export function PaginaHistorialVentas() {
  const { propiedadesHistorial } = useHistorialVentas()

  return <HistorialVentas {...propiedadesHistorial} />
}
