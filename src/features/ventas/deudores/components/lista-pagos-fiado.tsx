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

/**
 * Cada pago que recibio un fiado, en dos lineas: arriba la fecha y el monto, y abajo por que via se pago (al
 * registrar la venta o con que recibo). Con el monto en su propia linea, un detalle largo no se parte al lado de el
 * y no se lee mal ("Al registrar $3.000 la venta").
 */
export function ListaPagosFiado({ idLista, numeroComprobante, pagos, className }: ListaPagosFiadoProps) {
  return (
    <ul
      id={idLista}
      aria-label={`Pagos del fiado ${numeroComprobante}`}
      className={cn('flex flex-col gap-interno text-cuerpo', className)}
    >
      {pagos.map((pago, indice) => (
        <li key={`${pago.fechaHora}-${indice}`} className="flex flex-col">
          <span className="flex items-baseline justify-between gap-interno">
            <span className="tabular-nums">{formatearFecha(pago.fechaHora)}</span>
            <span className="shrink-0 font-medium whitespace-nowrap tabular-nums">{formatearMoneda(pago.monto)}</span>
          </span>
          {/* whitespace-nowrap: el numero de recibo no se parte en el guion */}
          <span className="text-auxiliar whitespace-nowrap text-texto-suave">
            {pago.numeroRecibo === null ? 'Al registrar la venta' : `Recibo ${pago.numeroRecibo}`}
          </span>
        </li>
      ))}
    </ul>
  )
}
