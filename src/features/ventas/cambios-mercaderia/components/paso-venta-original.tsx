import { FiltrosBusquedaVenta } from '@/features/ventas/cambios-mercaderia/components/filtros-busqueda-venta'
import { ListaVentasVinculables } from '@/features/ventas/cambios-mercaderia/components/lista-ventas-vinculables'
import { ResumenVentaVinculada } from '@/features/ventas/cambios-mercaderia/components/resumen-venta-vinculada'
import type {
  AccionesAltaCambio,
  BorradorCambio,
  PropiedadesBusquedaVenta,
} from '@/features/ventas/cambios-mercaderia/types/cambio'

/** Props del paso "Venta original". */
interface PasoVentaOriginalProps {
  borrador: BorradorCambio
  busquedaVenta: PropiedadesBusquedaVenta
  acciones: AccionesAltaCambio
}

/**
 * Paso 1, opcional: vincular la venta original. Con una venta ya elegida muestra su resumen y deja
 * cambiarla; sin ella ofrece la busqueda (solo ventas completadas) o seguir sin vincular.
 */
export function PasoVentaOriginal({ borrador, busquedaVenta, acciones }: PasoVentaOriginalProps) {
  if (borrador.ventaVinculada) {
    return (
      <section aria-labelledby="titulo-venta-original" className="flex flex-col gap-3">
        <h2 id="titulo-venta-original" className="text-base font-bold">
          Venta original
        </h2>
        <ResumenVentaVinculada
          venta={borrador.ventaVinculada}
          etiquetaQuitar="Elegir otra venta"
          onDesvincularVenta={acciones.onDesvincularVenta}
        />
      </section>
    )
  }

  return (
    <section aria-labelledby="titulo-venta-original" className="flex flex-col gap-4">
      <h2 id="titulo-venta-original" className="text-base font-bold">
        Venta original <span className="font-normal text-texto-suave">(opcional)</span>
      </h2>
      <FiltrosBusquedaVenta propiedades={busquedaVenta} />
      <ListaVentasVinculables propiedades={busquedaVenta} />
    </section>
  )
}
