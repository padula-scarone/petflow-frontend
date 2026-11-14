import { HistorialVentas } from '@/features/ventas/components/historial-ventas'
import { useHistorialVentas } from '@/features/ventas/hooks/use-historial-ventas'
import { ContenedorCobroFiado } from '@/features/ventas/paginas/contenedor-cobro-fiado'

/** Ruta de Ventas > Historial: conecta el hook con la vista. */
export function PaginaHistorialVentas() {
  const { propiedadesHistorial, cobro } = useHistorialVentas()

  return (
    <>
      <HistorialVentas {...propiedadesHistorial} />
      {cobro && <ContenedorCobroFiado key={cobro.fila.idVenta} {...cobro} />}
    </>
  )
}
