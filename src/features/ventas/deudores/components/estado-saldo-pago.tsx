import { Check, NotebookPen, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props del estado del saldo del pago. */
interface EstadoSaldoPagoProps {
  queDebe: number
  excedente: number
  /** Solo el pago mixto puede ajustar los montos de las lineas automaticamente. */
  puedeAjustarAutomaticamente: boolean
  onAjustarAutomaticamente: () => void
  className?: string
}

/**
 * Siempre muestra uno de tres estados: queda debiendo, total cubierto o excedido. Evoluciona el "Falta cubrir" del
 * pago mixto: ya no es un error, porque lo que no se paga ahora puede quedar como deuda.
 */
export function EstadoSaldoPago({
  queDebe,
  excedente,
  puedeAjustarAutomaticamente,
  onAjustarAutomaticamente,
  className,
}: EstadoSaldoPagoProps) {
  if (excedente > 0) {
    return (
      <div className={cn('flex flex-wrap items-center justify-between gap-x-interno gap-y-2', className)}>
        <p role="status" className="flex items-center gap-1 text-cuerpo font-medium text-peligro tabular-nums">
          <TriangleAlert aria-hidden="true" className="size-4 shrink-0" />
          Excedido por {formatearMoneda(excedente)}
        </p>
        {puedeAjustarAutomaticamente && (
          <Button type="button" variant="outline" className="bg-fondo-tarjeta" onClick={onAjustarAutomaticamente}>
            Ajustar automáticamente
          </Button>
        )}
      </div>
    )
  }

  if (queDebe > 0) {
    return (
      <p
        role="status"
        className={cn(
          'flex items-center justify-between gap-interno text-cuerpo font-medium text-amber-700 tabular-nums',
          className,
        )}
      >
        <span className="flex items-center gap-1">
          <NotebookPen aria-hidden="true" className="size-4 shrink-0" />
          Queda debiendo
        </span>
        <span className="text-cifra-secundaria font-bold">{formatearMoneda(queDebe)}</span>
      </p>
    )
  }

  return (
    <p role="status" className={cn('flex items-center gap-1 text-cuerpo font-medium text-green-700', className)}>
      <Check aria-hidden="true" className="size-4 shrink-0" />
      Total cubierto
    </p>
  )
}
