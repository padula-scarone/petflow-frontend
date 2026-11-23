import { CalendarX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { describirFechaEstimada } from '@/features/ventas/deudores/utils/fechas-estimadas'

/** Props de la proxima fecha de pago de un deudor. */
interface EstadoProximoPagoProps {
  /** AAAA-MM-DD; null si ningun fiado pendiente tiene fecha. */
  fecha: string | null
  vencido: boolean
  /** Sin saldo no hay nada que pagar: no se muestra "Sin fecha" sino un guion. */
  tieneSaldo: boolean
  /** Con una fecha vencida, "Vencido" va en una segunda linea en vez de al lado: para columnas angostas. */
  apilado?: boolean
  className?: string
}

/** La fecha del proximo pago. Una fecha vencida se destaca con color, icono y la palabra "Vencido". */
export function EstadoProximoPago({ fecha, vencido, tieneSaldo, apilado = false, className }: EstadoProximoPagoProps) {
  if (!tieneSaldo) return <span className={cn('text-texto-suave', className)}>—</span>
  if (fecha === null) return <span className={cn('text-texto-suave', className)}>Sin fecha</span>

  if (apilado && vencido) {
    return (
      <span className={cn('flex flex-col font-medium text-peligro tabular-nums whitespace-nowrap', className)}>
        <span className="inline-flex items-center gap-1">
          <CalendarX aria-hidden="true" className="size-4 shrink-0" />
          <span className="sr-only">Vencido: </span>
          {describirFechaEstimada(fecha)}
        </span>
        <span aria-hidden="true" className="pl-5 text-auxiliar">
          Vencido
        </span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 tabular-nums whitespace-nowrap',
        vencido && 'font-medium text-peligro',
        className,
      )}
    >
      {vencido && <CalendarX aria-hidden="true" className="size-4 shrink-0" />}
      {vencido && <span className="sr-only">Vencido: </span>}
      {describirFechaEstimada(fecha)}
      {vencido && <span aria-hidden="true">· Vencido</span>}
    </span>
  )
}
