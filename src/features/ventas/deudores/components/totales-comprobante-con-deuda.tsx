import type { ReactNode } from 'react'
import { formatearMoneda, formatearMonedaConSigno } from '@/lib/formatear-moneda'
import type { ComprobanteConDeuda } from '@/features/ventas/deudores/types/comprobante-con-deuda'

/** Props del resumen del total de una venta con deuda. */
interface TotalesComprobanteConDeudaProps {
  comprobante: ComprobanteConDeuda
}

/** Describe un porcentaje con signo, por ejemplo "−10 %" o "+15 %". */
function describirPorcentaje(porcentaje: number) {
  return `${porcentaje < 0 ? '−' : '+'}${Math.abs(porcentaje)} %`
}

/** Props de una fila del calculo. */
interface FilaResumenProps {
  etiqueta: string
  /** Aclaracion debajo de la etiqueta: el motivo de un descuento o el porcentaje de un medio. */
  detalle?: ReactNode
  importe: string
}

/** Una fila del calculo: la etiqueta a la izquierda y el importe a la derecha. */
function FilaResumen({ etiqueta, detalle, importe }: FilaResumenProps) {
  return (
    <div className="flex items-baseline justify-between gap-interno">
      <dt className="min-w-0 text-texto-suave">
        {etiqueta}
        {detalle && <span className="block text-auxiliar tabular-nums">{detalle}</span>}
      </dt>
      <dd className="shrink-0 font-medium whitespace-nowrap tabular-nums">{importe}</dd>
    </div>
  )
}

/**
 * El calculo de una venta con deuda: lo que vale la venta, lo que se pago ahora y lo que queda debiendo.
 * No se muestra "pagado + debe = total": con recargos o descuentos de los medios esa suma no cierra, porque el
 * ajuste solo alcanza a lo que se pago ahora.
 */
export function TotalesComprobanteConDeuda({ comprobante }: TotalesComprobanteConDeudaProps) {
  const { descuentoManual, pagos, importeVenta, montoPagadoAhora, montoAdeudado, tipoDeuda } = comprobante
  const subtotalProductos = comprobante.detalles.reduce((acumulado, detalle) => acumulado + detalle.subtotal, 0)
  const ajustesMedios = pagos.filter((pago) => pago.montoAjuste !== 0)
  const hayDesglose = descuentoManual !== null

  return (
    <section aria-labelledby="titulo-totales" className="flex flex-col gap-interno">
      <h2 id="titulo-totales" className="text-titulo-seccion font-bold">
        Deuda
      </h2>

      {hayDesglose && (
        <dl className="flex flex-col gap-interno">
          <FilaResumen etiqueta="Subtotal productos" importe={formatearMoneda(subtotalProductos)} />
          {descuentoManual && (
            <FilaResumen
              etiqueta="Descuento manual"
              detalle={descuentoManual.motivo}
              importe={formatearMonedaConSigno(-descuentoManual.monto)}
            />
          )}
        </dl>
      )}

      <dl className="flex flex-col gap-interno">
        <FilaResumen etiqueta="Importe de la venta" importe={formatearMoneda(importeVenta)} />
        {tipoDeuda === 'PARCIAL' && (
          <>
            {ajustesMedios.map((pago) => (
              <FilaResumen
                key={pago.idMedioPago}
                etiqueta={`${pago.montoAjuste < 0 ? 'Descuento' : 'Recargo'} ${pago.nombreMedioPago}`}
                detalle={describirPorcentaje(pago.porcentajeAjuste)}
                importe={formatearMonedaConSigno(pago.montoAjuste)}
              />
            ))}
            <div className="flex items-baseline justify-between gap-interno text-green-700">
              <dt className="font-medium">Pagó ahora</dt>
              <dd className="shrink-0 font-bold whitespace-nowrap tabular-nums">{formatearMoneda(montoPagadoAhora)}</dd>
            </div>
          </>
        )}
      </dl>

      <p className="flex items-baseline justify-between gap-interno border-t pt-interno">
        <span className="text-titulo-seccion font-bold">Queda debiendo</span>
        <span className="shrink-0 text-cifra-principal font-bold text-amber-700 tabular-nums">
          {formatearMoneda(montoAdeudado)}
        </span>
      </p>

      <p className="text-cuerpo text-texto-suave">
        {tipoDeuda === 'TOTAL'
          ? 'No ingresó a la caja: queda pendiente hasta que el cliente la pague.'
          : 'Lo pagado ahora ingresó a la caja. El resto queda pendiente hasta que el cliente lo pague.'}
      </p>
    </section>
  )
}
