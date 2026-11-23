import { DetalleDevolucion } from '@/features/ventas/devoluciones/components/detalle-devolucion'
import { DialogoConfirmarAccionDevolucion } from '@/features/ventas/devoluciones/components/dialogo-confirmar-accion-devolucion'
import { ListaDevoluciones } from '@/features/ventas/devoluciones/components/lista-devoluciones'
import { PanelFiltrosDevoluciones } from '@/features/ventas/devoluciones/components/panel-filtros-devoluciones'
import { ResumenResultadosDevoluciones } from '@/features/ventas/devoluciones/components/resumen-resultados-devoluciones'
import type { DevolucionesProps } from '@/features/ventas/devoluciones/types/devolucion'
import { AvisoHistorial } from '@/features/ventas/components/aviso-historial'
import { ContenedorFiltrosFijos } from '@/features/ventas/components/contenedor-filtros-fijos'

export function Devoluciones({
  estadoLista,
  propiedadesFiltros,
  acciones,
  aviso,
  detalle,
  confirmacion,
  onCargarNuevaDevolucion,
  onCambiarPagina,
  onReintentar,
  onCerrarAviso,
  onCerrarDetalle,
  onReintentarDetalle,
  onConfirmarAccionDevolucion,
  onCancelarConfirmacion,
  onSeleccionarMotivo,
  onCambiarDetalleMotivo,
}: DevolucionesProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-bloque">
      {/* Sin titulo visible: la pestana de la seccion ya dice donde estamos */}
      <h1 className="sr-only">Devoluciones</h1>

      {/* --- FILTROS Y "CARGAR NUEVA DEVOLUCIÓN" (FIJOS AL HACER SCROLL) --- */}
      <ContenedorFiltrosFijos>
        <PanelFiltrosDevoluciones propiedades={propiedadesFiltros} onCargarNuevaDevolucion={onCargarNuevaDevolucion} />
      </ContenedorFiltrosFijos>

      {/* --- RESUMEN: CUANTAS DEVOLUCIONES, FILTROS APLICADOS Y LIMPIAR --- */}
      <ResumenResultadosDevoluciones estadoLista={estadoLista} propiedadesFiltros={propiedadesFiltros} />

      {aviso && <AvisoHistorial aviso={aviso} onCerrar={onCerrarAviso} />}

      {/* --- LISTA --- */}
      <ListaDevoluciones
        estadoLista={estadoLista}
        acciones={acciones}
        onCambiarPagina={onCambiarPagina}
        onReintentar={onReintentar}
        onLimpiarFiltros={propiedadesFiltros.onLimpiarFiltros}
        onCargarNuevaDevolucion={onCargarNuevaDevolucion}
      />

      {/* --- PANELES SUPERPUESTOS --- */}
      <DetalleDevolucion
        detalle={detalle}
        acciones={acciones}
        onCerrar={onCerrarDetalle}
        onReintentar={onReintentarDetalle}
      />
      <DialogoConfirmarAccionDevolucion
        confirmacion={confirmacion}
        onConfirmar={onConfirmarAccionDevolucion}
        onCancelar={onCancelarConfirmacion}
        onSeleccionarMotivo={onSeleccionarMotivo}
        onCambiarDetalleMotivo={onCambiarDetalleMotivo}
      />
    </section>
  )
}
