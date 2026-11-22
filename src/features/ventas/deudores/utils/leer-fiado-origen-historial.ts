import type { FiadoOrigenHistorial } from '@/features/ventas/deudores/types/cuenta-corriente'
import { esObjeto } from '@/lib/es-objeto'

/** Clave bajo la que "Ver deuda" manda el fiado del Historial en el estado del router. */
export const CLAVE_FIADO_ORIGEN_HISTORIAL = 'fiadoOrigenHistorial'

/** Lee el fiado que mando el Historial en el estado del router; null si no vino o no tiene la forma esperada. */
export function leerFiadoOrigenHistorial(estadoRouter: unknown): FiadoOrigenHistorial | null {
  if (!esObjeto(estadoRouter)) return null
  const candidato = estadoRouter[CLAVE_FIADO_ORIGEN_HISTORIAL]
  if (!esObjeto(candidato)) return null

  const { idVenta, numeroComprobante, fechaHora, importeAdeudado, montoPagado, fechaEstimadaPago } = candidato
  const valido =
    typeof idVenta === 'number' &&
    typeof numeroComprobante === 'string' &&
    typeof fechaHora === 'string' &&
    typeof importeAdeudado === 'number' &&
    typeof montoPagado === 'number' &&
    (typeof fechaEstimadaPago === 'string' || fechaEstimadaPago === null)
  return valido
    ? { idVenta, numeroComprobante, fechaHora, importeAdeudado, montoPagado, fechaEstimadaPago }
    : null
}
