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

/** Cuenta los filtros que viven dentro de "Mas filtros": origen y medio de pago. */
export function contarFiltrosAdicionales(filtros: FiltrosHistorial) {
  return [filtros.origen !== null, filtros.medioPago !== null].filter(Boolean).length
}

/**
 * Cuenta los filtros que viven dentro de la hoja de mobile: todos menos el N.º de comprobante, que esta siempre a la
 * vista. El rango de fechas cuenta como uno solo.
 */
export function contarFiltrosEnHoja(filtros: FiltrosHistorial) {
  const condiciones = [
    filtros.fechaDesde !== null || filtros.fechaHasta !== null,
    filtros.productoSeleccionado !== null,
    filtros.estado !== null,
    filtros.textoCliente.trim() !== '',
  ]
  return condiciones.filter(Boolean).length + contarFiltrosAdicionales(filtros)
}

/** Cuenta todos los filtros con valor, tambien el N.º de comprobante. */
export function contarFiltrosActivos(filtros: FiltrosHistorial) {
  return contarFiltrosEnHoja(filtros) + (filtros.numeroComprobante.trim() !== '' ? 1 : 0)
}
