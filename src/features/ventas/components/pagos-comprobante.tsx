import { formatearMoneda } from '@/lib/formatear-moneda'
import type { Comprobante } from '@/features/ventas/types/comprobante'

/** Props de la seccion de pagos del comprobante, o de la deuda si la venta es un fiado. */
interface PagosComprobanteProps {
  comprobante: Comprobante
}

export function PagosComprobante({ comprobante }: PagosComprobanteProps) {
  // --- FIADO: NO HAY PAGOS, QUEDA UNA DEUDA ---
  if (comprobante.estado === 'pendiente-pago') {
    return (
      <section aria-labelledby="titulo-deuda" className="flex flex-col gap-3">
        <h2 id="titulo-deuda" className="text-base font-bold">
          Deuda
        </h2>
        <p className="flex items-baseline justify-between gap-3">
          <span className="min-w-0">
            <span className="block text-sm text-texto-suave">A nombre de</span>
            <span className="block truncate font-medium">{comprobante.clienteReferencia}</span>
          </span>
          <span className="shrink-0 text-xl font-bold tabular-nums">
            {formatearMoneda(comprobante.montoTotal)}
          </span>
        </p>
        <p className="text-sm text-texto-suave">
          No ingresó a la caja: queda pendiente hasta que el cliente la liquide.
        </p>
      </section>
    )
  }

  // --- VENTA COBRADA: UN RENGLON POR MEDIO DE PAGO ---
  return (
    <section aria-labelledby="titulo-pagos" className="flex flex-col gap-3">
      <h2 id="titulo-pagos" className="text-base font-bold">
        Medios de pago
      </h2>
      <ul className="flex flex-col gap-3">
        {comprobante.pagos.map((pago) => (
          <li key={pago.idMedioPago} className="flex flex-col gap-1 rounded-grande border p-3">
            <p className="flex items-baseline justify-between gap-3">
              <span className="font-medium">{pago.nombreMedioPago}</span>
              <span className="font-bold tabular-nums">{formatearMoneda(pago.montoFinal)}</span>
            </p>
            {pago.montoAjuste !== 0 && (
              <p className="text-sm text-texto-suave tabular-nums">
                Parte del total: {formatearMoneda(pago.montoBase)}
              </p>
            )}
            {/* Sin "Paga con" el back no registra recibido ni vuelto: no hay nada que mostrar */}
            {pago.admiteVuelto && pago.montoRecibido !== null && pago.vuelto !== null && (
              <p className="flex flex-wrap justify-between gap-x-3 text-sm text-texto-suave tabular-nums">
                <span>Recibido: {formatearMoneda(pago.montoRecibido)}</span>
                <span>Vuelto: {formatearMoneda(pago.vuelto)}</span>
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
