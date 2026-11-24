import { formatearMoneda } from '@/lib/formatear-moneda'
import type { PagoComprobante } from '@/features/ventas/types/comprobante'

/** Props de la seccion de pagos del comprobante. Le alcanza con los pagos: lo usa tambien el comprobante de una venta con deuda. */
interface PagosComprobanteProps {
  comprobante: { pagos: readonly PagoComprobante[] }
}

export function PagosComprobante({ comprobante }: PagosComprobanteProps) {
  // --- VENTA COBRADA: UN RENGLON POR MEDIO DE PAGO ---
  return (
    <section aria-labelledby="titulo-pagos" className="flex flex-col gap-interno">
      <h2 id="titulo-pagos" className="text-titulo-seccion font-bold">
        Medios de pago
      </h2>
      <ul className="flex flex-col gap-interno">
        {comprobante.pagos.map((pago) => (
          <li key={pago.idMedioPago} className="flex flex-col gap-1 rounded-grande border p-contorno">
            <p className="flex items-baseline justify-between gap-interno">
              <span className="font-medium">{pago.nombreMedioPago}</span>
              <span className="font-bold tabular-nums">{formatearMoneda(pago.montoFinal)}</span>
            </p>
            {pago.montoAjuste !== 0 && (
              <p className="flex justify-between gap-interno text-cuerpo text-texto-suave">
                <span>Parte del total</span>
                <span className="tabular-nums">{formatearMoneda(pago.montoBase)}</span>
              </p>
            )}
            {/* Sin "Paga con" el back no registra recibido ni vuelto: no hay nada que mostrar */}
            {pago.admiteVuelto && pago.montoRecibido !== null && pago.vuelto !== null && (
              <>
                <p className="flex justify-between gap-interno text-cuerpo text-texto-suave">
                  <span>Recibido</span>
                  <span className="tabular-nums">{formatearMoneda(pago.montoRecibido)}</span>
                </p>
                <p className="flex justify-between gap-interno text-cuerpo text-texto-suave">
                  <span>Vuelto</span>
                  <span className="tabular-nums">{formatearMoneda(pago.vuelto)}</span>
                </p>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
