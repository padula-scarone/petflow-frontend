import type {
  BorradorDevolucion,
  FiltrosBusquedaVenta,
} from '@/features/ventas/devoluciones/types/devolucion'

/** Alta de devolución sin nada cargado. */
export const BORRADOR_DEVOLUCION_VACIA: BorradorDevolucion = {
  ventaVinculada: null,
  articuloDevuelto: null,
  articuloEntregado: null,
  idMedioPago: null,
  montoRecibido: null,
  codigoMotivo: null,
  detalleMotivo: '',
}

/** Busqueda de venta sin ninguna restriccion (igual solo trae las COMPLETADA). */
export const FILTROS_BUSQUEDA_VENTA_VACIOS: FiltrosBusquedaVenta = {
  fechaDesde: null,
  fechaHasta: null,
  productoSeleccionado: null,
  origen: null,
  medioPago: null,
  numeroComprobante: '',
}

/** Cuenta los filtros con valor de la busqueda de venta. El rango de fechas cuenta como uno solo. */
export function contarFiltrosBusquedaVenta(filtros: FiltrosBusquedaVenta) {
  return [
    filtros.fechaDesde !== null || filtros.fechaHasta !== null,
    filtros.productoSeleccionado !== null,
    filtros.origen !== null,
    filtros.medioPago !== null,
    filtros.numeroComprobante.trim() !== '',
  ].filter(Boolean).length
}
