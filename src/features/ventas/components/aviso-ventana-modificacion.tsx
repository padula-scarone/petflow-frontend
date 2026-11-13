import { cn } from '@/lib/utils'
import { formatearHora } from '@/lib/formatear-fecha-hora'

/** Props del texto que avisa hasta cuando se puede editar o anular un registro. */
interface AvisoVentanaModificacionProps {
  ventanaVigente: boolean
  /** ISO 8601; null si el registro esta anulado. */
  fechaHoraLimiteModificacion: string | null
  className?: string
}

/**
 * "Se puede editar o anular hasta las 14:47". Solo existe mientras la ventana esta vigente: al vencer,
 * o en un registro anulado, no muestra nada. Sin segundos ni icono, para no distraer.
 */
export function AvisoVentanaModificacion({
  ventanaVigente,
  fechaHoraLimiteModificacion,
  className,
}: AvisoVentanaModificacionProps) {
  if (!ventanaVigente || fechaHoraLimiteModificacion === null) return null

  return (
    <p className={cn('text-xs text-texto-suave tabular-nums', className)}>
      Se puede editar o anular hasta las {formatearHora(fechaHoraLimiteModificacion)}
    </p>
  )
}
