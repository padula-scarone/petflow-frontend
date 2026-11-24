import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props del boton que muestra u oculta los pagos de un fiado. */
interface BotonPagosFiadoProps {
  idLista: string
  numeroComprobante: string
  montoPagado: number
  cantidadPagos: number
  /** Texto antes del monto, por ejemplo "Pagado ". */
  prefijo?: string
  abierto: boolean
  onAlternar: () => void
  className?: string
}

/**
 * Lo ya pagado de un fiado. Si tiene pagos, el monto es un boton que despliega cada pago con su fecha; sin pagos es
 * solo el monto (cero).
 */
export function BotonPagosFiado({
  idLista,
  numeroComprobante,
  montoPagado,
  cantidadPagos,
  prefijo = '',
  abierto,
  onAlternar,
  className,
}: BotonPagosFiadoProps) {
  if (cantidadPagos === 0) {
    return <span className={cn('whitespace-nowrap tabular-nums', className)}>{formatearMoneda(montoPagado)}</span>
  }

  return (
    <Button
      type="button"
      variant="ghost"
      aria-expanded={abierto}
      aria-controls={idLista}
      aria-label={`${formatearMoneda(montoPagado)} pagado en ${cantidadPagos} ${cantidadPagos === 1 ? 'pago' : 'pagos'}. ${abierto ? 'Ocultar' : 'Ver'} los pagos del fiado ${numeroComprobante}`}
      className={cn('gap-1 px-3 font-normal tabular-nums', className)}
      onClick={onAlternar}
    >
      {prefijo}
      {formatearMoneda(montoPagado)}
      <ChevronDown
        aria-hidden="true"
        className={cn('size-4 transition-transform motion-reduce:transition-none', abierto && 'rotate-180')}
      />
    </Button>
  )
}
