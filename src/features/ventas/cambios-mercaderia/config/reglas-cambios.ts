import type { EstadoVentaHistorial } from '@/features/ventas/types/historial'

// Reglas de negocio de Cambios posventa que la vista necesita en un solo lugar.
// PENDIENTE DE ACTUALIZAR EL SSOT: ninguna de estas reglas figura todavia en CUB 1.4.

/**
 * Estados de venta que se pueden vincular a un cambio. Solo COMPLETADA: un fiado (PENDIENTE_PAGO)
 * primero se cobra o se anula, y una venta ANULADA ya no existe a efectos comerciales.
 * Es la unica fuente de esta regla: la busqueda de ventas y cualquier validacion la leen de aca.
 */
export const ESTADOS_VENTA_VINCULABLES: readonly EstadoVentaHistorial[] = ['COMPLETADA']

/** true si una venta con ese estado puede vincularse a un cambio. */
export function esVentaVinculable(estado: EstadoVentaHistorial) {
  return ESTADOS_VENTA_VINCULABLES.includes(estado)
}

/** Ventas por pagina en la busqueda del alta: pocas, porque se muestran en un modal. */
export const CANTIDAD_VENTAS_POR_PAGINA_BUSQUEDA = 5

/** Texto que explica el bloqueo cuando el producto entregado vale menos que el devuelto. */
export const MENSAJE_PRECIO_IGUAL_O_MAYOR = 'Solo se puede cambiar por un producto de igual o mayor valor'

/** Peso minimo de una bolsa abierta devuelta, en kg: debe ser mayor a 0. */
export const PESO_MINIMO_BOLSA_ABIERTA_KG = 0.001
