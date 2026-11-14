import type { VentaDetalle, VentaHistorial } from '@/features/ventas/types/historial'

// Temporal: lo usa Cambios posventa hasta que se integre con el back.

/** Deja solo los campos que devuelve la grilla del historial. */
export function obtenerVentaHistorial(venta: VentaDetalle): VentaHistorial {
  return {
    idVenta: venta.idVenta,
    numeroComprobante: venta.numeroComprobante,
    fechaHora: venta.fechaHora,
    estado: venta.estado,
    montoTotal: venta.montoTotal,
    clienteReferencia: venta.clienteReferencia,
    origen: venta.origen,
    modalidadEntrega: venta.modalidadEntrega,
    fechaHoraLimiteModificacion: venta.fechaHoraLimiteModificacion,
  }
}
