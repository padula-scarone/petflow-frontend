import { cn } from '@/lib/utils'
import { formatearFecha } from '@/lib/formatear-fecha-hora'
import { formatearMoneda } from '@/lib/formatear-moneda'
import type { PagoFiado } from '@/features/ventas/deudores/types/cuenta-corriente'

/** Props de la lista de pagos de un fiado. */
interface ListaPagosFiadoProps {
  idLista: string
  numeroComprobante: string
  pagos: PagoFiado[]
  className?: string
}

/** Cada pago que recibio un fiado: cuando, por que via (al venderse o con que recibo) y cuanto. */
export function ListaPagosFiado({ idLista, numeroComprobante, pagos, className }: ListaPagosFiadoProps) {
  return (
    <ul id={idLista} aria-label={`Pagos del fiado ${numeroComprobante}`} className={cn('flex flex-col gap-1 text-cuerpo', className)}>
      {pagos.map((pago, indice) => (
        <li key={`${pago.fechaHora}-${indice}`} className="flex items-baseline justify-between gap-interno">
          <span className="min-w-0 tabular-nums">
            {formatearFecha(pago.fechaHora)}
            <span className="text-texto-suave">
              {' · '}
              {pago.numeroRecibo === null ? 'Al registrar la venta' : `Recibo ${pago.numeroRecibo}`}
            </span>
          </span>
          <span className="shrink-0 font-medium whitespace-nowrap tabular-nums">{formatearMoneda(pago.monto)}</span>
        </li>
      ))}
    </ul>
  )
}
