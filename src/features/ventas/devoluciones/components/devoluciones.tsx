import { DetalleDevolucion } from '@/features/ventas/devoluciones/components/detalle-devolucion'
import { DialogoConfirmarAccionDevolucion } from '@/features/ventas/devoluciones/components/dialogo-confirmar-accion-devolucion'
import { ListaDevoluciones } from '@/features/ventas/devoluciones/components/lista-devoluciones'
import { PanelFiltrosDevoluciones } from '@/features/ventas/devoluciones/components/panel-filtros-devoluciones'
import { ResumenResultadosDevoluciones } from '@/features/ventas/devoluciones/components/resumen-resultados-devoluciones'
import type { DevolucionesProps } from '@/features/ventas/devoluciones/types/devolucion'
import { AvisoHistorial } from '@/features/ventas/components/aviso-historial'

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
      {/* Mismas clases que el Historial: los margenes negativos cubren el padding del area con scroll,
          y en mobile el top suma el alto de la cabecera mientras esta visible (--alto-cabecera) */}
      {/* La barra queda metida bajo el aire inferior de la cabecera (su margen negativo), asi la separacion con las
          pestanas sigue siendo un contorno. Por eso el top resta un contorno mas, sin pasar de 0 cuando la cabecera
          se oculta: ahi la barra pega al borde con su propio relleno */}
      <div className="sticky top-[max(calc(var(--spacing-contorno)*-1),calc(var(--alto-cabecera,0px)-var(--spacing-contorno)*2))] z-20 -mx-contorno -mt-contorno bg-fondo-pagina px-contorno pt-contorno pb-interno transition-[top] duration-200 motion-reduce:transition-none">
        <PanelFiltrosDevoluciones
          propiedades={propiedadesFiltros}
          estadoLista={estadoLista}
          onCargarNuevaDevolucion={onCargarNuevaDevolucion}
        />
      </div>

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
