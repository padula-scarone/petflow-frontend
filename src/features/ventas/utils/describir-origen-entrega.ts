import type { ModalidadEntrega, OrigenVenta } from '@/features/ventas/types/historial'

/** Devuelve el origen de la venta para mostrar: "Mostrador" o "Digital". */
export function describirOrigen(origen: OrigenVenta) {
  return origen === 'MOSTRADOR' ? 'Mostrador' : 'Digital'
}

/** Devuelve la modalidad de entrega para mostrar: "Retiro" o "Envío". */
export function describirEntrega(modalidadEntrega: ModalidadEntrega) {
  return modalidadEntrega === 'RETIRO' ? 'Retiro' : 'Envío'
}
