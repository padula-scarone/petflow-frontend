import { DetalleCambio } from '@/features/ventas/cambios-mercaderia/components/detalle-cambio'
import { DialogoConfirmarAccionCambio } from '@/features/ventas/cambios-mercaderia/components/dialogo-confirmar-accion-cambio'
import { ListaCambios } from '@/features/ventas/cambios-mercaderia/components/lista-cambios'
import { PanelFiltrosCambios } from '@/features/ventas/cambios-mercaderia/components/panel-filtros-cambios'
import { ResumenResultadosCambios } from '@/features/ventas/cambios-mercaderia/components/resumen-resultados-cambios'
import type { CambiosPosventaProps } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { AvisoHistorial } from '@/features/ventas/components/aviso-historial'

export function CambiosPosventa({
  estadoLista,
  propiedadesFiltros,
  acciones,
  aviso,
  detalle,
  confirmacion,
  onCargarNuevoCambio,
  onCambiarPagina,
  onReintentar,
  onCerrarAviso,
  onCerrarDetalle,
  onReintentarDetalle,
  onConfirmarAccionCambio,
  onCancelarConfirmacion,
  onSeleccionarMotivo,
  onCambiarDetalleMotivo,
}: CambiosPosventaProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-bloque">
      {/* Sin titulo visible: la pestana de la seccion ya dice donde estamos */}
      <h1 className="sr-only">Cambios posventa</h1>

      {/* --- FILTROS Y "CARGAR NUEVO CAMBIO" (FIJOS AL HACER SCROLL) --- */}
      {/* Mismas clases que el Historial: los margenes negativos cubren el padding del area con scroll,
          y en mobile el top suma el alto de la cabecera mientras esta visible (--alto-cabecera) */}
      <div className="sticky top-[calc(var(--alto-cabecera,0px)-var(--spacing-contorno))] z-20 -mx-contorno -mt-contorno bg-fondo-pagina px-contorno pt-contorno pb-interno transition-[top] duration-200 motion-reduce:transition-none">
        <PanelFiltrosCambios
          propiedades={propiedadesFiltros}
          estadoLista={estadoLista}
          onCargarNuevoCambio={onCargarNuevoCambio}
        />
      </div>

      {/* --- RESUMEN: CUANTOS CAMBIOS, FILTROS APLICADOS Y LIMPIAR --- */}
      <ResumenResultadosCambios estadoLista={estadoLista} propiedadesFiltros={propiedadesFiltros} />

      {aviso && <AvisoHistorial aviso={aviso} onCerrar={onCerrarAviso} />}

      {/* --- LISTA --- */}
      <ListaCambios
        estadoLista={estadoLista}
        acciones={acciones}
        onCambiarPagina={onCambiarPagina}
        onReintentar={onReintentar}
        onLimpiarFiltros={propiedadesFiltros.onLimpiarFiltros}
        onCargarNuevoCambio={onCargarNuevoCambio}
      />

      {/* --- PANELES SUPERPUESTOS --- */}
      <DetalleCambio
        detalle={detalle}
        acciones={acciones}
        onCerrar={onCerrarDetalle}
        onReintentar={onReintentarDetalle}
      />
      <DialogoConfirmarAccionCambio
        confirmacion={confirmacion}
        onConfirmar={onConfirmarAccionCambio}
        onCancelar={onCancelarConfirmacion}
        onSeleccionarMotivo={onSeleccionarMotivo}
        onCambiarDetalleMotivo={onCambiarDetalleMotivo}
      />
    </section>
  )
}
