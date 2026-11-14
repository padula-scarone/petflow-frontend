import {
  CODIGO_MOTIVO_OTRO,
  LONGITUD_MAXIMA_DETALLE_MOTIVO,
} from '@/features/ventas/config/motivos-venta'

/**
 * Indica si el motivo alcanza para confirmar: hay uno elegido y, con "Otro", un detalle de 1 a 200
 * caracteres sin contar los espacios de los extremos (la misma regla del motivo del descuento).
 */
export function esMotivoValido(codigoMotivo: string | null, detalleMotivo: string) {
  if (codigoMotivo === null) return false
  if (codigoMotivo !== CODIGO_MOTIVO_OTRO) return true
  const largo = detalleMotivo.trim().length
  return largo >= 1 && largo <= LONGITUD_MAXIMA_DETALLE_MOTIVO
}
