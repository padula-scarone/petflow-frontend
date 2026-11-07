import { formatearMonedaConSigno } from '@/lib/formatear-moneda'
import type { Comprobante } from '@/features/ventas/types/comprobante'

/** Props de la lista de descuentos y recargos del comprobante. */
interface AjustesComprobanteProps {
  comprobante: Comprobante
}

/** Describe un porcentaje con signo, por ejemplo "−10 %" o "+15 %". */
function describirPorcentaje(porcentaje: number) {
  return `${porcentaje < 0 ? '−' : '+'}${Math.abs(porcentaje)} %`
}

export function AjustesComprobante({ comprobante }: AjustesComprobanteProps) {
  const { descuentoManual } = comprobante
  // En un fiado todavia no hay pagos, por lo tanto tampoco ajustes de medios
  const ajustesMedios =
    comprobante.estado === 'completada'
      ? comprobante.pagos.filter((pago) => pago.montoAjuste !== 0)
      : []
  const hayAjustes = descuentoManual !== null || ajustesMedios.length > 0

  return (
    <section aria-labelledby="titulo-ajustes" className="flex flex-col gap-3">
      <h2 id="titulo-ajustes" className="text-base font-bold">
        Descuentos y recargos
      </h2>

      {!hayAjustes && <p className="text-texto-suave">Sin descuentos ni recargos</p>}

      <ul className="flex flex-col gap-3">
        {descuentoManual && (
          <li className="flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">Descuento manual</p>
              <p className="text-sm text-texto-suave">{descuentoManual.motivo}</p>
            </div>
            <span className="shrink-0 font-bold whitespace-nowrap tabular-nums">
              {formatearMonedaConSigno(-descuentoManual.monto)}
            </span>
          </li>
        )}
        {ajustesMedios.map((pago) => (
          <li key={pago.idMedioPago} className="flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">
                {pago.montoAjuste < 0 ? 'Descuento' : 'Recargo'} {pago.nombreMedioPago}
              </p>
              <p className="text-sm text-texto-suave tabular-nums">
                {describirPorcentaje(pago.porcentajeAjuste)}
              </p>
            </div>
            <span className="shrink-0 font-bold whitespace-nowrap tabular-nums">
              {formatearMonedaConSigno(pago.montoAjuste)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
