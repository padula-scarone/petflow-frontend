import { AvisoHistorial } from '@/features/ventas/components/aviso-historial'
import { ContenedorFiltrosFijos } from '@/features/ventas/components/contenedor-filtros-fijos'
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
  onReintentarDeudaFiado,
  onAnularVenta,
  onCancelarConfirmacion,
  onSeleccionarMotivo,
  onCambiarDetalleMotivo,
}: HistorialVentasProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-bloque">
      {/* Sin titulo visible: la pestana de la seccion ya dice donde estamos */}
      <h1 className="sr-only">Historial de ventas</h1>

      {/* --- FILTROS (FIJOS AL HACER SCROLL) --- */}
      <ContenedorFiltrosFijos>
        <PanelFiltrosHistorial propiedades={propiedadesFiltros} />
      </ContenedorFiltrosFijos>

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
        onReintentarDeudaFiado={onReintentarDeudaFiado}
      />
      <DialogoConfirmarAccionVenta
        confirmacion={confirmacion}
        onAnularVenta={onAnularVenta}
        onCancelar={onCancelarConfirmacion}
        onSeleccionarMotivo={onSeleccionarMotivo}
        onCambiarDetalleMotivo={onCambiarDetalleMotivo}
      />
    </section>
  )
}
