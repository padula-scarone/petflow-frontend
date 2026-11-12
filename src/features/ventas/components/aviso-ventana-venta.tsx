import { cn } from '@/lib/utils'
import { formatearHora } from '@/lib/formatear-fecha-hora'
import type { FilaHistorial } from '@/features/ventas/types/historial'

/** Props del texto que avisa hasta cuando se puede editar o anular una venta. */
interface AvisoVentanaVentaProps {
  fila: FilaHistorial
  className?: string
}

/**
 * "Se puede editar o anular hasta las 14:47". Solo existe mientras la ventana esta vigente: al vencer,
 * o en una venta anulada, no muestra nada. Sin segundos ni icono, para no distraer.
 */
export function AvisoVentanaVenta({ fila, className }: AvisoVentanaVentaProps) {
  if (!fila.ventanaVigente || fila.fechaHoraLimiteModificacion === null) return null

  return (
    <p className={cn('text-xs text-texto-suave tabular-nums', className)}>
      Se puede editar o anular hasta las {formatearHora(fila.fechaHoraLimiteModificacion)}
    </p>
  )
}
