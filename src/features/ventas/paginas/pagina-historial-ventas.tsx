import { HistorialVentas } from '@/features/ventas/components/historial-ventas'
import { useHistorialVentasEjemplo } from '@/features/ventas/hooks/use-historial-ventas-ejemplo'
import { ContenedorCobroFiado } from '@/features/ventas/paginas/contenedor-cobro-fiado'

/** Ruta de Ventas > Historial: conecta el hook con la vista. */
export function PaginaHistorialVentas() {
  const { propiedadesHistorial, filaACobrar, liquidarFiado, cerrarCobro, verRecibo, actualizarListado } =
    useHistorialVentasEjemplo()

  return (
    <>
      <HistorialVentas {...propiedadesHistorial} />
      {filaACobrar && (
        <ContenedorCobroFiado
          key={filaACobrar.idVenta}
          fila={filaACobrar}
          liquidarFiado={liquidarFiado}
          onCerrar={cerrarCobro}
          onVerRecibo={verRecibo}
          onActualizarListado={actualizarListado}
        />
      )}
    </>
  )
}
