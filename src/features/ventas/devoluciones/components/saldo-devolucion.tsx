import { cn } from '@/lib/utils'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props del monto del saldo de una devolución, alineado a la derecha. */
interface SaldoDevolucionProps {
  saldo: number
  /** Una devolución anulada ya no entro a la caja: se muestra apagada. */
  anulado: boolean
  className?: string
}

/** Saldo en pesos, con tabular-nums para que los montos de la columna se alineen por la coma. */
export function SaldoDevolucion({ saldo, anulado, className }: SaldoDevolucionProps) {
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
