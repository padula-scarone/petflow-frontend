import { formatearMoneda, formatearMonedaConSigno } from '@/lib/formatear-moneda'

/** Props del resumen de totales del comprobante. */
interface TotalesComprobanteProps {
  subtotalProductos: number
  montoTotal: number
}

export function TotalesComprobante({ subtotalProductos, montoTotal }: TotalesComprobanteProps) {
  // Neto de todos los descuentos y recargos: lo que separa el subtotal del total
  const netoAjustes = montoTotal - subtotalProductos

  return (
    <section aria-label="Totales" className="flex flex-col gap-3">
      <dl className="flex flex-col gap-2">
        <div className="flex justify-between gap-3">
          <dt className="text-texto-suave">Subtotal productos</dt>
          <dd className="font-medium tabular-nums">{formatearMoneda(subtotalProductos)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-texto-suave">Descuentos y recargos</dt>
          <dd className="font-medium whitespace-nowrap tabular-nums">
            {formatearMonedaConSigno(netoAjustes)}
          </dd>
        </div>
      </dl>
      <p className="flex items-baseline justify-between gap-3 border-t pt-3">
        <span className="text-lg font-bold">Total</span>
        <span className="text-3xl font-bold tabular-nums">{formatearMoneda(montoTotal)}</span>
      </p>
    </section>
  )
}
