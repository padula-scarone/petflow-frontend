import type { FiltrosHistorial } from '@/features/ventas/types/historial'

/** Filtros del historial sin ninguna restriccion. */
export const FILTROS_HISTORIAL_VACIOS: FiltrosHistorial = {
  fechaDesde: null,
  fechaHasta: null,
  productoSeleccionado: null,
  estado: null,
  origen: null,
  medioPago: null,
  textoCliente: '',
  numeroComprobante: '',
}

/** Cuenta los filtros que viven dentro de "Mas filtros": origen, medio de pago y comprobante. */
export function contarFiltrosAdicionales(filtros: FiltrosHistorial) {
  return [
    filtros.origen !== null,
    filtros.medioPago !== null,
    filtros.numeroComprobante.trim() !== '',
  ].filter(Boolean).length
}

/** Cuenta todos los filtros con valor. El rango de fechas cuenta como uno solo. */
export function contarFiltrosActivos(filtros: FiltrosHistorial) {
  const condiciones = [
    filtros.fechaDesde !== null || filtros.fechaHasta !== null,
    filtros.productoSeleccionado !== null,
    filtros.estado !== null,
    filtros.textoCliente.trim() !== '',
  ]
  return condiciones.filter(Boolean).length + contarFiltrosAdicionales(filtros)
}
