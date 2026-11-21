import type { ReactNode } from 'react'
import { formatearMoneda, formatearMonedaConSigno } from '@/lib/formatear-moneda'
import { cn } from '@/lib/utils'
import type { Comprobante } from '@/features/ventas/types/comprobante'

/** Props del resumen del total del comprobante. */
interface TotalesComprobanteProps {
  comprobante: Comprobante
  /** Una venta anulada no deja deuda aunque fuera un fiado: se muestra como un total comun. */
  anulada?: boolean
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
 * El calculo del total: subtotal de los productos, cada descuento o recargo y el total. Es una sola seccion, y el
 * total cierra el desglose sin una linea que lo separe, porque no es otra seccion.
 * - Sin descuentos ni recargos el desglose sobra (el subtotal seria igual al total) y tambien el titulo: queda
 *   solo la fila del total.
 * - En un fiado la deuda ocupa el lugar del total: es la misma cifra, dicha una sola vez, con el nombre del deudor.
 */
export function TotalesComprobante({ comprobante, anulada = false }: TotalesComprobanteProps) {
  const { descuentoManual, subtotalProductos, montoTotal } = comprobante
  // En un fiado todavia no hay pagos, por lo tanto tampoco ajustes de medios
  const ajustesMedios =
    comprobante.estado === 'completada'
      ? comprobante.pagos.filter((pago) => pago.montoAjuste !== 0)
      : []
  const hayAjustes = descuentoManual !== null || ajustesMedios.length > 0
  // Nombre del deudor; null si no es una deuda (venta cobrada o anulada)
  const nombreDeudor =
    comprobante.estado === 'pendiente-pago' && !anulada ? comprobante.clienteReferencia : null
  const titulo = nombreDeudor !== null ? 'Deuda' : hayAjustes ? 'Resumen' : null

  return (
    <section
      aria-labelledby={titulo ? 'titulo-totales' : undefined}
      aria-label={titulo ? undefined : 'Total'}
      className="flex flex-col gap-interno"
    >
      {titulo && (
        <h2 id="titulo-totales" className="text-titulo-seccion font-bold">
          {titulo}
        </h2>
      )}
      {hayAjustes && (
        <dl className="flex flex-col gap-interno">
          <FilaResumen etiqueta="Subtotal productos" importe={formatearMoneda(subtotalProductos)} />
          {descuentoManual && (
            <FilaResumen
              etiqueta="Descuento manual"
              detalle={descuentoManual.motivo}
              importe={formatearMonedaConSigno(-descuentoManual.monto)}
            />
          )}
          {ajustesMedios.map((pago) => (
            <FilaResumen
              key={pago.idMedioPago}
              etiqueta={`${pago.montoAjuste < 0 ? 'Descuento' : 'Recargo'} ${pago.nombreMedioPago}`}
              detalle={describirPorcentaje(pago.porcentajeAjuste)}
              importe={formatearMonedaConSigno(pago.montoAjuste)}
            />
          ))}
        </dl>
      )}
      <div className={cn('flex items-baseline justify-between gap-interno', hayAjustes && 'pt-interno')}>
        {nombreDeudor !== null ? (
          <span className="min-w-0">
            <span className="block text-cuerpo text-texto-suave">A nombre de</span>
            <span className="block truncate font-medium">{nombreDeudor}</span>
          </span>
        ) : (
          <span className="text-titulo-seccion font-bold">Total</span>
        )}
        <span className="shrink-0 text-cifra-principal font-bold tabular-nums">{formatearMoneda(montoTotal)}</span>
      </div>
      {nombreDeudor !== null && (
        <p className="text-cuerpo text-texto-suave">
          No ingresó a la caja: queda pendiente hasta que el cliente la liquide.
        </p>
      )}
    </section>
  )
}
