import { EstadoCatalogoProductos } from '@/features/ventas/components/estado-catalogo-productos'
import { FiltrosBusquedaVenta } from '@/features/ventas/cambios-mercaderia/components/filtros-busqueda-venta'
import { ListaVentasVinculables } from '@/features/ventas/cambios-mercaderia/components/lista-ventas-vinculables'
import { ResumenVentaVinculada } from '@/features/ventas/cambios-mercaderia/components/resumen-venta-vinculada'
import type {
  AccionesAltaCambio,
  BorradorCambio,
  PropiedadesBusquedaVenta,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import type { EstadoCargaRecurso } from '@/features/ventas/types/carga'

/** Props del paso "Venta original". */
interface PasoVentaOriginalProps {
  borrador: BorradorCambio
  busquedaVenta: PropiedadesBusquedaVenta
  /** Sin el catalogo no se puede vincular una venta: de el salen los datos de bolsa abierta de sus renglones. */
  estadoCatalogo: EstadoCargaRecurso
  onReintentarCatalogo: () => void
  acciones: AccionesAltaCambio
}

/**
 * Paso 1, opcional: vincular la venta original. Con una venta ya elegida muestra su resumen y deja
 * cambiarla; sin ella ofrece la busqueda (solo ventas completadas) o seguir sin vincular.
 */
export function PasoVentaOriginal({
  borrador,
  busquedaVenta,
  estadoCatalogo,
  onReintentarCatalogo,
  acciones,
}: PasoVentaOriginalProps) {
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
      {estadoCatalogo.fase === 'listo' ? (
        <>
          <FiltrosBusquedaVenta propiedades={busquedaVenta} />
          <ListaVentasVinculables propiedades={busquedaVenta} />
        </>
      ) : (
        <EstadoCatalogoProductos estadoCatalogo={estadoCatalogo} onReintentar={onReintentarCatalogo} />
      )}
    </section>
  )
}
