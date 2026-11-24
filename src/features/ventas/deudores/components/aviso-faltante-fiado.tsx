import { cn } from '@/lib/utils'
import { formatearMoneda } from '@/lib/formatear-moneda'
import type { FilaHistorial } from '@/features/ventas/types/historial'

/** Props del aviso de lo que falta pagar de un fiado. */
interface AvisoFaltanteFiadoProps {
  fila: FilaHistorial
  className?: string
}

/** "Falta $X de $Y" en un fiado que ya pago una parte. El estado sigue siendo "Pendiente de pago". */
export function AvisoFaltanteFiado({ fila, className }: AvisoFaltanteFiadoProps) {
  const { montoFaltante } = fila
  if (fila.estado !== 'PENDIENTE_PAGO' || montoFaltante === undefined || montoFaltante >= fila.montoTotal) return null

  return (
    <span className={cn('text-auxiliar font-medium whitespace-nowrap text-amber-700 tabular-nums', className)}>
      Falta {formatearMoneda(montoFaltante)} de {formatearMoneda(fila.montoTotal)}
    </span>
  )
}
