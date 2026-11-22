import { Badge } from '@/components/ui/badge'
import { formatearFechaHora } from '@/lib/formatear-fecha-hora'
import { formatearMoneda, formatearMonedaConSigno } from '@/lib/formatear-moneda'
import { BotonesEnvioComprobante } from '@/features/ventas/components/botones-envio-comprobante'
import { EncabezadoExitoVenta } from '@/features/ventas/components/encabezado-exito-venta'
import type { ReciboCobroDeudor } from '@/features/ventas/deudores/types/cobro-deudor'

/** Props del recibo consolidado de un cobro. */
interface ReciboCobroDeudorProps {
  recibo: ReciboCobroDeudor
}

/**
 * Recibo consolidado: un solo comprobante para todos los fiados que se cobraron, con su propio numero. Dice cuanto
 * se abono a cada uno y si quedo completado o cuanto le falta todavia, y cuanto queda debiendo la persona.
 */
export function ReciboCobroDeudorContenido({ recibo }: ReciboCobroDeudorProps) {
  const ajustesMedios = recibo.pagos.filter((pago) => pago.montoAjuste !== 0)

  return (
    <div className="flex flex-col gap-bloque">
      <EncabezadoExitoVenta estado="completada" titulo="Cobro registrado" />

      {/* --- ENCABEZADO DEL RECIBO --- */}
      <dl className="grid grid-cols-2 gap-x-bloque gap-y-interno text-cuerpo">
        <div>
          <dt className="text-texto-suave">Recibo</dt>
          <dd className="font-bold tabular-nums">{recibo.numeroRecibo}</dd>
        </div>
        <div>
          <dt className="text-texto-suave">Fecha</dt>
          <dd className="font-medium tabular-nums">{formatearFechaHora(recibo.fechaHora)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-texto-suave">Deudor</dt>
          <dd className="truncate font-medium">{recibo.deudor.nombreCompleto}</dd>
        </div>
        <div>
          <dt className="text-texto-suave">Vendedor</dt>
          <dd className="font-medium">{recibo.nombreVendedor}</dd>
        </div>
      </dl>

      {/* --- FIADOS ABONADOS --- */}
      <section aria-labelledby="titulo-fiados-abonados" className="flex flex-col gap-interno">
        <h2 id="titulo-fiados-abonados" className="text-titulo-seccion font-bold">
          Fiados abonados
        </h2>
        <ul className="flex flex-col gap-interno">
          {recibo.fiadosAbonados.map((fiado) => (
            <li key={fiado.idVenta} className="flex flex-col gap-1 rounded-grande border p-contorno">
              <p className="flex items-baseline justify-between gap-interno">
                <span className="font-medium tabular-nums">{fiado.numeroComprobante}</span>
                <span className="font-bold tabular-nums">{formatearMoneda(fiado.montoAbonado)}</span>
              </p>
              <p className="flex items-center justify-between gap-interno text-cuerpo text-texto-suave">
                {fiado.estadoResultante === 'COMPLETADA' ? (
                  <Badge variant="outline" className="text-green-700">
                    Completado
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-700">
                    Sigue pendiente
                  </Badge>
                )}
                {fiado.estadoResultante === 'PENDIENTE_PAGO' && (
                  <span className="tabular-nums">Falta {formatearMoneda(fiado.montoFaltanteResultante)}</span>
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* --- MEDIOS DE PAGO Y TOTAL --- */}
      <dl className="flex flex-col gap-interno text-cuerpo">
        {recibo.pagos.map((pago) => (
          <div key={pago.idMedioPago} className="flex justify-between gap-interno">
            <dt className="text-texto-suave">{pago.nombreMedioPago}</dt>
            <dd className="font-medium tabular-nums">{formatearMoneda(pago.montoFinal)}</dd>
          </div>
        ))}
        {ajustesMedios.map((pago) => (
          <div key={`ajuste-${pago.idMedioPago}`} className="flex justify-between gap-interno">
            <dt className="text-texto-suave">
              {pago.montoAjuste < 0 ? 'Descuento' : 'Recargo'} {pago.nombreMedioPago}
            </dt>
            <dd className="font-medium whitespace-nowrap tabular-nums">{formatearMonedaConSigno(pago.montoAjuste)}</dd>
          </div>
        ))}
        {recibo.vuelto !== null && (
          <div className="flex justify-between gap-interno">
            <dt className="text-texto-suave">Vuelto</dt>
            <dd className="font-medium tabular-nums">{formatearMoneda(recibo.vuelto)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-interno border-t pt-interno">
          <dt className="text-titulo-seccion font-bold">Total cobrado</dt>
          <dd className="text-cifra-principal font-bold tabular-nums">{formatearMoneda(recibo.montoTotalCobrado)}</dd>
        </div>
        <div className="flex justify-between gap-interno">
          <dt className="text-texto-suave">Saldo restante del deudor</dt>
          <dd className="font-bold tabular-nums">{formatearMoneda(recibo.saldoRestanteDeudor)}</dd>
        </div>
      </dl>

      {/* --- ENVIO DEL RECIBO --- */}
      <div className="flex gap-2">
        <BotonesEnvioComprobante
          enlaceWhatsApp={recibo.enlaceWhatsApp}
          enlaceMail={recibo.enlaceMail}
          variante="compacta"
        />
      </div>
    </div>
  )
}
