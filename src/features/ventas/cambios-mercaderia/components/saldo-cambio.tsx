import { cn } from '@/lib/utils'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props del monto del saldo de un cambio, alineado a la derecha. */
interface SaldoCambioProps {
  saldo: number
  /** Un cambio anulado ya no entro a la caja: se muestra apagado. */
  anulado: boolean
  className?: string
}

/** Saldo en pesos, con tabular-nums para que los montos de la columna se alineen por la coma. */
export function SaldoCambio({ saldo, anulado, className }: SaldoCambioProps) {
  return (
    <span
      className={cn(
        'font-bold whitespace-nowrap tabular-nums',
        anulado && 'font-normal text-texto-suave',
        className,
      )}
    >
      {formatearMoneda(saldo)}
    </span>
  )
}
