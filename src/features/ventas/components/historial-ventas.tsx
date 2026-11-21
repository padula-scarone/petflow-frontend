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
  onSeleccionarMotivo,
  onCambiarDetalleMotivo,
}: HistorialVentasProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-bloque">
      {/* Sin titulo visible: la pestana de la seccion ya dice donde estamos */}
      <h1 className="sr-only">Historial de ventas</h1>

      {/* --- FILTROS (FIJOS AL HACER SCROLL) --- */}
      {/* Los margenes negativos cubren el padding del area con scroll, asi la lista no se ve pasar por encima.
          El top negativo compensa ese mismo padding: sticky se mide desde el borde interno, no desde el borde real */}
      {/* En mobile el top suma el alto de la cabecera mientras esta visible (--alto-cabecera, que define el
          layout), asi la barra queda debajo de ella cuando reaparece y sube a 0 cuando se oculta */}
      {/* La barra queda metida bajo el aire inferior de la cabecera (su margen negativo), asi la separacion con las
          pestanas sigue siendo un contorno. Por eso el top resta un contorno mas, sin pasar de 0 cuando la cabecera
          se oculta: ahi la barra pega al borde con su propio relleno */}
      <div className="sticky top-[max(calc(var(--spacing-contorno)*-1),calc(var(--alto-cabecera,0px)-var(--spacing-contorno)*2))] z-20 -mx-contorno -mt-contorno bg-fondo-pagina px-contorno pt-contorno pb-interno transition-[top] duration-200 motion-reduce:transition-none">
        <PanelFiltrosHistorial propiedades={propiedadesFiltros} estadoLista={estadoLista} />
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
        onSeleccionarMotivo={onSeleccionarMotivo}
        onCambiarDetalleMotivo={onCambiarDetalleMotivo}
      />
    </section>
  )
}
