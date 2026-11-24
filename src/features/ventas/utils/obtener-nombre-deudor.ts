import type { DeudorFilaHistorial, EstadoVentaHistorial } from '@/features/ventas/types/historial'

/** Lo que hace falta de una venta para saber quien debe. */
interface DatosDeudaVenta {
  estado: EstadoVentaHistorial
  deudor: DeudorFilaHistorial | null
  clienteReferencia: string | null
}

/**
 * Nombre del deudor de una venta, o null si no tiene (una venta de contado no tiene "cliente": no se guarda).
 * Un fiado pendiente anterior al vinculo con deudores no tiene deudor, solo el nombre en texto libre: ese texto es
 * el unico dato de quien debe, asi que se usa. En cualquier otra venta, el texto libre es un dato viejo y se oculta.
 */
export function obtenerNombreDeudor({ estado, deudor, clienteReferencia }: DatosDeudaVenta): string | null {
  if (deudor !== null) return deudor.nombreCompleto
  return estado === 'PENDIENTE_PAGO' ? clienteReferencia : null
}
