import { AvisoHistorial } from '@/features/ventas/components/aviso-historial'
import { DetalleVentaHistorial } from '@/features/ventas/components/detalle-venta-historial'
import { DialogoConfirmarAccionVenta } from '@/features/ventas/components/dialogo-confirmar-accion-venta'
import { ListaVentasHistorial } from '@/features/ventas/components/lista-ventas-historial'
import { PanelFiltrosHistorial } from '@/features/ventas/components/panel-filtros-historial'
import { ResumenResultadosHistorial } from '@/features/ventas/components/resumen-resultados-historial'
import type { HistorialVentasProps } from '@/features/ventas/types/historial'

export function HistorialVentas({
  estadoLista,
  propiedadesFiltros,
  acciones,
  aviso,
  detalle,
  confirmacion,
  onCambiarPagina,
  onReintentar,
  onCerrarAviso,
  onCerrarDetalle,
  onReintentarDetalle,
  onEditarVenta,
  onAnularVenta,
  onCancelarConfirmacion,
}: HistorialVentasProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4">
      {/* Sin titulo visible: la pestana de la seccion ya dice donde estamos */}
      <h1 className="sr-only">Historial de ventas</h1>

      {/* --- FILTROS (FIJOS AL HACER SCROLL) --- */}
      {/* Los margenes negativos cubren el padding del area con scroll, asi la lista no se ve pasar por encima.
          El top negativo compensa ese mismo padding: sticky se mide desde el borde interno, no desde el borde real */}
      <div className="sticky -top-4 z-20 -mx-4 -mt-4 bg-fondo-pagina px-4 pt-4 pb-3 xl:-top-8 xl:-mx-8 xl:-mt-8 xl:px-8 xl:pt-8">
        <PanelFiltrosHistorial propiedades={propiedadesFiltros} />
      </div>

      {/* --- RESUMEN: CUANTAS VENTAS, FILTROS APLICADOS Y LIMPIAR --- */}
      <ResumenResultadosHistorial estadoLista={estadoLista} propiedadesFiltros={propiedadesFiltros} />

      {aviso && <AvisoHistorial aviso={aviso} onCerrar={onCerrarAviso} />}

      {/* --- LISTA --- */}
      <ListaVentasHistorial
        estadoLista={estadoLista}
        acciones={acciones}
        onCambiarPagina={onCambiarPagina}
        onReintentar={onReintentar}
        onLimpiarFiltros={propiedadesFiltros.onLimpiarFiltros}
      />

      {/* --- PANELES SUPERPUESTOS --- */}
      <DetalleVentaHistorial
        detalle={detalle}
        acciones={acciones}
        onCerrar={onCerrarDetalle}
        onReintentar={onReintentarDetalle}
      />
      <DialogoConfirmarAccionVenta
        confirmacion={confirmacion}
        onEditarVenta={onEditarVenta}
        onAnularVenta={onAnularVenta}
        onCancelar={onCancelarConfirmacion}
      />
    </section>
  )
}
