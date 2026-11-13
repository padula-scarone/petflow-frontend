import {
  CODIGO_MOTIVO_OTRO,
  ETIQUETA_POR_MOTIVO,
  LONGITUD_MAXIMA_DETALLE_MOTIVO,
} from '@/features/ventas/config/motivos-venta'
import type { CodigoMotivo, DatosAnulacion } from '@/features/ventas/types/historial'

/**
 * Indica si el motivo alcanza para confirmar: hay uno elegido y, con "Otro", un detalle de 1 a 200
 * caracteres sin contar los espacios de los extremos (la misma regla del motivo del descuento).
 */
export function esMotivoValido(codigoMotivo: CodigoMotivo | null, detalleMotivo: string) {
  if (codigoMotivo === null) return false
  if (codigoMotivo !== CODIGO_MOTIVO_OTRO) return true
  const largo = detalleMotivo.trim().length
  return largo >= 1 && largo <= LONGITUD_MAXIMA_DETALLE_MOTIVO
}

/** Texto de un motivo ya guardado: la etiqueta, o "Otro: detalle" cuando se escribio uno. */
export function describirMotivo({ motivo, detalleMotivo }: Pick<DatosAnulacion, 'motivo' | 'detalleMotivo'>) {
  return motivo === CODIGO_MOTIVO_OTRO && detalleMotivo
    ? `Otro: ${detalleMotivo}`
    : ETIQUETA_POR_MOTIVO[motivo]
}
