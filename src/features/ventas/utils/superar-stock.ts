import type { ArticuloCarrito } from '@/features/ventas/types/venta'

/**
 * Indica si la cantidad del articulo supera el stock disponible. La usan el aviso de cada tarjeta y el bloqueo
 * del cobro, para que no se contradigan. Cantidad y stock salen de dividir un entero por 1000, asi que dos
 * valores iguales dan exactamente el mismo numero y la comparacion no falla por decimales.
 */
export function superaStockDisponible(articulo: ArticuloCarrito): boolean {
  return articulo.cantidad > articulo.stockDisponible
}
