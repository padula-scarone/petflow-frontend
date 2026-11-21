/** Texto que se muestra cuando una devolución es anterior a que se guardara el motivo. */
export const TEXTO_MOTIVO_NO_REGISTRADO = 'Sin motivo registrado'

/**
 * Texto de un motivo ya guardado. El back lo guarda como texto libre (la etiqueta elegida o lo escrito en
 * "Otro"), asi que se muestra tal cual; una devolución vieja sin motivo (null) muestra un texto de respaldo.
 */
export function describirMotivoDevolucion(motivo: string | null) {
  return motivo !== null && motivo.trim() !== '' ? motivo : TEXTO_MOTIVO_NO_REGISTRADO
}
