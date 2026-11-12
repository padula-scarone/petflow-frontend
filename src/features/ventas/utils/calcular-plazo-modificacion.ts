import { MINUTOS_PLAZO_MODIFICACION } from '@/features/ventas/config/plazo-modificacion'
import type { FilaHistorial, VentaHistorial } from '@/features/ventas/types/historial'

const MILISEGUNDOS_POR_MINUTO = 60 * 1000

/**
 * Calcula hasta cuando se puede editar o anular una venta (lo que en la integracion decide el back).
 * El plazo corre desde el pago en un fiado saldado y desde la venta en el resto; una anulada no tiene plazo.
 */
export function calcularLimiteModificacion(
  venta: Pick<VentaHistorial, 'estado' | 'fechaHora'> & { fechaHoraPago: string | null },
): string | null {
  if (venta.estado === 'ANULADA') return null
  const instanteBase = Date.parse(venta.fechaHoraPago ?? venta.fechaHora)
  return new Date(instanteBase + MINUTOS_PLAZO_MODIFICACION * MILISEGUNDOS_POR_MINUTO).toISOString()
}

/** Convierte una venta de la grilla en una fila con su ventana evaluada contra la hora del servidor. */
export function crearFilaHistorial(venta: VentaHistorial, ahoraServidorMilisegundos: number): FilaHistorial {
  const limite = venta.fechaHoraLimiteModificacion
  return {
    ...venta,
    ventanaVigente:
      venta.estado !== 'ANULADA' && limite !== null && Date.parse(limite) > ahoraServidorMilisegundos,
    puedeCobrarFiado: venta.estado === 'PENDIENTE_PAGO',
  }
}
