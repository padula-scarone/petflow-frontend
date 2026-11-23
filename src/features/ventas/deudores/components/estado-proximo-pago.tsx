import { CalendarX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { describirFechaEstimada } from '@/features/ventas/deudores/utils/fechas-estimadas'

/** Props de la proxima fecha de pago de un deudor. */
interface EstadoProximoPagoProps {
  /** AAAA-MM-DD; null si ningun fiado pendiente tiene fecha. */
  fecha: string | null
  /** Verdadero si la fecha ya paso: se muestra como "Atrasado". */
  vencido: boolean
  /** Sin saldo no hay nada que pagar: no se muestra "Sin fecha" sino un guion. */
  tieneSaldo: boolean
  className?: string
}

/**
 * La fecha del proximo pago. Una fecha que ya paso se destaca con color e icono, y debajo, mas chico, dice "Atrasado":
 * en una segunda linea para que la columna no se ensanche.
 */
export function EstadoProximoPago({ fecha, vencido, tieneSaldo, className }: EstadoProximoPagoProps) {
  if (!tieneSaldo) return <span className={cn('text-texto-suave', className)}>—</span>
  if (fecha === null) return <span className={cn('text-texto-suave', className)}>Sin fecha</span>

  if (!vencido) {
    return <span className={cn('whitespace-nowrap tabular-nums', className)}>{describirFechaEstimada(fecha)}</span>
  }

  return (
    <span className={cn('flex flex-col font-medium whitespace-nowrap text-peligro tabular-nums', className)}>
      <span className="inline-flex items-center gap-1">
        <CalendarX aria-hidden="true" className="size-4 shrink-0" />
        <span className="sr-only">Atrasado: </span>
        {describirFechaEstimada(fecha)}
      </span>
      {/* pl-5: queda alineado con la fecha, despues del icono (size-4 + gap-1) */}
      <span aria-hidden="true" className="pl-5 text-auxiliar font-normal">
        Atrasado
      </span>
    </span>
  )
}
