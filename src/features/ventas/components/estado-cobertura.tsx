import { Check, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props del estado de cobertura del pago mixto. */
interface EstadoCoberturaProps {
  faltaCubrir: number
  excedente: number
  onAjustarAutomaticamente: () => void
  className?: string
}

/** Muestra siempre uno de tres estados: falta cubrir, cubierto o excedido. */
export function EstadoCobertura({
  faltaCubrir,
  excedente,
  onAjustarAutomaticamente,
  className,
}: EstadoCoberturaProps) {
  if (excedente > 0) {
    return (
      <div
        className={cn('flex flex-wrap items-center justify-between gap-x-3 gap-y-2', className)}
      >
        <p
          role="status"
          className="flex items-center gap-1 text-sm font-medium text-peligro tabular-nums"
        >
          <TriangleAlert aria-hidden="true" className="size-4 shrink-0" />
          Excedido por {formatearMoneda(excedente)}
        </p>
        <Button
          type="button"
          variant="outline"
          className="h-11 bg-fondo-tarjeta px-4 text-sm"
          onClick={onAjustarAutomaticamente}
        >
          Ajustar automáticamente
        </Button>
      </div>
    )
  }

  if (faltaCubrir > 0) {
    return (
      <p
        role="status"
        className={cn(
          'flex items-center justify-between gap-3 text-sm font-medium text-amber-700 tabular-nums',
          className,
        )}
      >
        <span>Falta cubrir</span>
        <span className="font-bold">{formatearMoneda(faltaCubrir)}</span>
      </p>
    )
  }

  return (
    <p
      role="status"
      className={cn('flex items-center gap-1 text-sm font-medium text-green-700', className)}
    >
      <Check aria-hidden="true" className="size-4 shrink-0" />
      Total cubierto
    </p>
  )
}
