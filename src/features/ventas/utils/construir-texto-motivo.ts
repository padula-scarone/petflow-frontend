import { CODIGO_MOTIVO_OTRO, ETIQUETA_POR_MOTIVO } from '@/features/ventas/config/motivos-venta'
import type { CodigoMotivo } from '@/features/ventas/types/historial'

/**
 * Arma el texto de un motivo (1 a 200 caracteres) para el back, que no guarda codigos: con un motivo de la
 * lista se envia su etiqueta y con "Otro" el detalle escrito, recortado. Nunca supera 200: las etiquetas son
 * fijas y cortas, y el detalle ya esta acotado a 200 por el formulario (`esMotivoValido`).
 * Lo usan Ventas (anulacion) y Cambios (alta y anulacion), cada uno con su catalogo de etiquetas.
 */
export function construirTextoMotivoConEtiquetas(
  codigoMotivo: string,
  detalleMotivo: string,
  etiquetaPorCodigo: Record<string, string>,
) {
  return codigoMotivo === CODIGO_MOTIVO_OTRO ? detalleMotivo.trim() : (etiquetaPorCodigo[codigoMotivo] ?? '')
}

/**
 * Arma el `motivo` del body de la anulacion de una venta.
 * Editar y Anular usan el mismo texto: no se agrega ningun prefijo que marque que vino de una edicion.
 */
export function construirTextoMotivo(codigoMotivo: CodigoMotivo, detalleMotivo: string) {
  return construirTextoMotivoConEtiquetas(codigoMotivo, detalleMotivo, ETIQUETA_POR_MOTIVO)
}
