import { HistorialVentas } from '@/features/ventas/components/historial-ventas'
import {
  COBRO_FIADO_LEGADO_ACTIVO,
  DECORAR_HISTORIAL_CON_DEUDORES_EJEMPLO,
} from '@/features/ventas/deudores/config/maqueta-deudores'
import { decorarHistorialConDeudoresEjemplo } from '@/features/ventas/deudores/ejemplos/decorar-historial-con-deudores-ejemplo'
import { useHistorialVentas } from '@/features/ventas/hooks/use-historial-ventas'
import { ContenedorCobroFiado } from '@/features/ventas/paginas/contenedor-cobro-fiado'

/** Ruta de Ventas > Historial: conecta el hook con la vista. */
export function PaginaHistorialVentas() {
  const { propiedadesHistorial, cobro } = useHistorialVentas()

  return (
    <>
      <HistorialVentas
        {...(DECORAR_HISTORIAL_CON_DEUDORES_EJEMPLO
          ? decorarHistorialConDeudoresEjemplo(propiedadesHistorial)
          : propiedadesHistorial)}
      />
      {/* El cobro de un fiado entero contra el back real queda apagado mientras "Ver deuda" lo reemplaza */}
      {COBRO_FIADO_LEGADO_ACTIVO && cobro && <ContenedorCobroFiado key={cobro.fila.idVenta} {...cobro} />}
    </>
  )
}
