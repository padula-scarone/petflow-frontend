import type {
  CambioMercaderiaListado,
  FilaCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import { MINUTOS_PLAZO_MODIFICACION } from '@/features/ventas/config/plazo-modificacion'

const MILISEGUNDOS_POR_MINUTO = 60 * 1000

/**
 * Hasta cuando se puede editar o anular un cambio (lo que en la integracion decide el back):
 * 15 minutos desde su fecha y hora (RF-VENTAS-09 y 10). Un cambio anulado no tiene plazo.
 */
export function calcularLimiteModificacionCambio(
  cambio: Pick<CambioMercaderiaListado, 'estado' | 'fechaHora'>,
): string | null {
  if (cambio.estado === 'ANULADO') return null
  return new Date(Date.parse(cambio.fechaHora) + MINUTOS_PLAZO_MODIFICACION * MILISEGUNDOS_POR_MINUTO).toISOString()
}

/** Convierte un cambio de la grilla en una fila con su ventana evaluada contra la hora del servidor. */
export function crearFilaCambio(cambio: CambioMercaderiaListado, ahoraServidorMilisegundos: number): FilaCambio {
  const limite = cambio.fechaHoraLimiteModificacion
  return {
    ...cambio,
    ventanaVigente:
      cambio.estado === 'ACTIVO' && limite !== null && Date.parse(limite) > ahoraServidorMilisegundos,
  }
}
