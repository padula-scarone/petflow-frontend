import { cn } from '@/lib/utils'
import { formatearFecha } from '@/lib/formatear-fecha-hora'
import { formatearMoneda } from '@/lib/formatear-moneda'
import type { PagoFiado } from '@/features/ventas/deudores/types/cuenta-corriente'

/** Props de la lista de pagos de un fiado. */
interface ListaPagosFiadoProps {
  idLista: string
  numeroComprobante: string
  pagos: PagoFiado[]
  /**
   * tarjeta (celular): cada pago en dos lineas, fecha y monto arriba y el detalle abajo, para que un detalle largo no se
   * parta al lado del monto. tabla (escritorio): una mini tabla con encabezados "Fecha de pago", "Detalle" y "Monto",
   * para que no se confunda con la "Fecha estimada" de la tabla de fiados.
   */
  variante: 'tarjeta' | 'tabla'
  className?: string
}

/** Cada pago que recibio un fiado: cuando, con que recibo y cuanto. El pago inicial tambien tiene su recibo. */
export function ListaPagosFiado({ idLista, numeroComprobante, pagos, variante, className }: ListaPagosFiadoProps) {
  const nombreAccesible = `Pagos del fiado ${numeroComprobante}`
  const describirVia = (pago: PagoFiado) => (pago.numeroRecibo === null ? 'Cobro' : `Recibo ${pago.numeroRecibo}`)

  if (variante === 'tabla') {
    return (
      <div
        id={idLista}
        role="table"
        aria-label={nombreAccesible}
        className={cn('grid grid-cols-[auto_1fr_auto] gap-x-bloque gap-y-1 text-cuerpo', className)}
      >
        <div
          role="row"
          className="col-span-full grid grid-cols-subgrid border-b pb-1 text-auxiliar font-medium text-texto-suave"
        >
          <span role="columnheader">Fecha de pago</span>
          <span role="columnheader">Detalle</span>
          <span role="columnheader" className="justify-self-end">
            Monto
          </span>
        </div>
        {pagos.map((pago, indice) => (
          <div
            key={`${pago.fechaHora}-${indice}`}
            role="row"
            className="col-span-full grid grid-cols-subgrid items-baseline"
          >
            <span role="cell" className="whitespace-nowrap tabular-nums">
              {formatearFecha(pago.fechaHora)}
            </span>
            <span role="cell" className="whitespace-nowrap text-texto-suave">
              {describirVia(pago)}
            </span>
            <span role="cell" className="justify-self-end font-medium whitespace-nowrap tabular-nums">
              {formatearMoneda(pago.monto)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ul id={idLista} aria-label={nombreAccesible} className={cn('flex flex-col gap-interno text-cuerpo', className)}>
      {pagos.map((pago, indice) => (
        <li key={`${pago.fechaHora}-${indice}`} className="flex flex-col">
          <span className="flex items-baseline justify-between gap-interno">
            <span className="tabular-nums">{formatearFecha(pago.fechaHora)}</span>
            <span className="shrink-0 font-medium whitespace-nowrap tabular-nums">{formatearMoneda(pago.monto)}</span>
          </span>
          {/* whitespace-nowrap: el numero de recibo no se parte en el guion */}
          <span className="text-auxiliar whitespace-nowrap text-texto-suave">{describirVia(pago)}</span>
        </li>
      ))}
    </ul>
  )
}
