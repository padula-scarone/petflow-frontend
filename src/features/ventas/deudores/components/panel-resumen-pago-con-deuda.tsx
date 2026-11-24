import { Card } from '@/components/ui/card'
import { formatearMoneda, formatearMonedaConSigno } from '@/lib/formatear-moneda'
import { BotonCancelarVenta } from '@/features/ventas/components/boton-cancelar-venta'
import { BotonConfirmarCobro } from '@/features/ventas/components/boton-confirmar-cobro'
import { EstadoSaldoPago } from '@/features/ventas/deudores/components/estado-saldo-pago'
import type { EstadoPagoConDeuda } from '@/features/ventas/deudores/types/pago-con-deuda'
import type { EstadoEnvioVenta } from '@/features/ventas/types/envio-venta'
import type { TipoEntrega } from '@/features/ventas/types/venta'

/** Props del panel de resumen del pago con deuda. Los botones solo se muestran en escritorio. */
interface PanelResumenPagoConDeudaProps {
  estadoPago: EstadoPagoConDeuda
  /** Estado del envio de una venta de contado (la que va al back real). */
  estadoEnvio: EstadoEnvioVenta
  /** Para que el resumen diga como se entrega, aunque la seccion Entrega quede fuera de la vista. */
  tipoEntrega: TipoEntrega
  /** Verdadero mientras se registra una venta con deuda. */
  registrandoConDeuda: boolean
  onConfirmarPago: () => void
  onCancelarVenta: () => void
  onAjustarMontosAutomaticamente: () => void
}

/** Resumen de la venta: lo que vale, lo que se cobra ahora y lo que queda debiendo. */
export function PanelResumenPagoConDeuda({
  estadoPago,
  estadoEnvio,
  tipoEntrega,
  registrandoConDeuda,
  onConfirmarPago,
  onCancelarVenta,
  onAjustarMontosAutomaticamente,
}: PanelResumenPagoConDeudaProps) {
  const { resumen, puedeConfirmar, motivoNoConfirmable, deuda, formaPago } = estadoPago
  const enviando = estadoEnvio.fase === 'enviando' || registrandoConDeuda

  return (
    <Card className="gap-bloque p-contorno xl:sticky xl:top-0">
      {/* --- DESGLOSE --- */}
      <dl className="flex flex-col gap-interno text-cuerpo">
        <div className="flex justify-between gap-interno">
          <dt className="text-texto-suave">Subtotal productos</dt>
          <dd className="shrink-0 font-medium whitespace-nowrap tabular-nums">
            {formatearMoneda(resumen.subtotalProductos)}
          </dd>
        </div>
        <div className="flex justify-between gap-interno">
          <dt className="text-texto-suave">Descuento manual</dt>
          <dd className="shrink-0 font-medium whitespace-nowrap tabular-nums">
            {formatearMonedaConSigno(-resumen.montoDescuentoManual)}
          </dd>
        </div>
        <div className="flex justify-between gap-interno border-t pt-interno">
          <dt className="font-medium">Importe de la venta</dt>
          <dd className="shrink-0 font-bold whitespace-nowrap tabular-nums">{formatearMoneda(resumen.importeVenta)}</dd>
        </div>
        <div className="flex justify-between gap-interno">
          <dt className="text-texto-suave">Descuento/recargo medio de pago</dt>
          <dd className="shrink-0 font-medium whitespace-nowrap tabular-nums">
            {formatearMonedaConSigno(resumen.ajusteMediosPago)}
          </dd>
        </div>
        <div className="flex justify-between gap-interno">
          <dt className="text-texto-suave">Entrega</dt>
          <dd className="shrink-0 font-medium">{tipoEntrega === 'envio' ? 'Envío' : 'Retiro'}</dd>
        </div>
      </dl>

      {/* --- LO QUE SE COBRA AHORA --- */}
      {/* Solo desde xl: en celular esto y lo que queda debiendo estan en el pie fijo, que siempre se ve */}
      <p className="hidden items-baseline justify-between gap-interno border-t pt-bloque xl:flex">
        <span className="text-cuerpo text-texto-suave">Cobrás ahora</span>
        <span className="text-cifra-principal font-bold tabular-nums">{formatearMoneda(resumen.cobradoAhora)}</span>
      </p>

      {/* --- LO QUE QUEDA DEBIENDO --- */}
      <EstadoSaldoPago
        queDebe={resumen.queDebe}
        excedente={resumen.excedente}
        puedeAjustarAutomaticamente={formaPago === 'mixto'}
        onAjustarAutomaticamente={onAjustarMontosAutomaticamente}
        className="hidden border-t pt-bloque xl:flex"
      />

      {/* --- ACCIONES (ESCRITORIO) --- */}
      <div className="hidden flex-col gap-interno border-t pt-bloque xl:flex">
        <BotonConfirmarCobro
          formaPago={deuda ? 'fiado' : 'unico'}
          etiqueta={deuda ? undefined : 'REGISTRAR VENTA'}
          habilitado={puedeConfirmar && !enviando}
          enviando={enviando}
          onConfirmarCobro={onConfirmarPago}
          className="w-full"
        />
        {!puedeConfirmar && motivoNoConfirmable && (
          <p role="status" className="text-center text-cuerpo text-amber-700 tabular-nums">
            {motivoNoConfirmable}
          </p>
        )}
        <BotonCancelarVenta etiqueta="Cancelar" onCancelarVenta={onCancelarVenta} deshabilitado={enviando} />
      </div>
    </Card>
  )
}
