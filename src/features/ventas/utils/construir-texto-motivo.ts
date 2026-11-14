import { CODIGO_MOTIVO_OTRO, ETIQUETA_POR_MOTIVO } from '@/features/ventas/config/motivos-venta'
import type { CodigoMotivo } from '@/features/ventas/types/historial'

/**
 * Arma el `motivo` del body de la anulacion (1 a 200 caracteres). El back no guarda codigos: con un motivo de la
 * lista se envia su etiqueta y con "Otro" el detalle escrito, recortado. Nunca supera 200: las etiquetas son
 * fijas y cortas, y el detalle ya esta acotado a 200 por el formulario (`esMotivoValido`).
 * Editar y Anular usan el mismo texto: no se agrega ningun prefijo que marque que vino de una edicion.
 */
export function construirTextoMotivo(codigoMotivo: CodigoMotivo, detalleMotivo: string) {
  return codigoMotivo === CODIGO_MOTIVO_OTRO ? detalleMotivo.trim() : ETIQUETA_POR_MOTIVO[codigoMotivo]
}
