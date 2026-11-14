import { Card } from '@/components/ui/card'
import { formatearMoneda, formatearMonedaConSigno } from '@/lib/formatear-moneda'
import { BotonCancelarVenta } from '@/features/ventas/components/boton-cancelar-venta'
import { BotonConfirmarCobro } from '@/features/ventas/components/boton-confirmar-cobro'
import { EstadoCobertura } from '@/features/ventas/components/estado-cobertura'
import { EstadoEnvioCobro } from '@/features/ventas/components/estado-envio-cobro'
import type { FormaPago, ResumenCobro } from '@/features/ventas/types/cobro'
import type { EstadoEnvioVenta } from '@/features/ventas/types/envio-venta'

/** Props del panel de resumen del cobro. Los botones solo se muestran en escritorio. */
interface PanelResumenCobroProps {
  resumen: ResumenCobro
  formaPago: FormaPago
  puedeConfirmar: boolean
  motivoNoConfirmable?: string
  estadoEnvio: EstadoEnvioVenta
  onConfirmarCobro: () => void
  onCancelarVenta: () => void
  onAjustarMontosAutomaticamente: () => void
}

export function PanelResumenCobro({
  resumen,
  formaPago,
  puedeConfirmar,
  motivoNoConfirmable,
  estadoEnvio,
  onConfirmarCobro,
  onCancelarVenta,
  onAjustarMontosAutomaticamente,
}: PanelResumenCobroProps) {
  const enviando = estadoEnvio.fase === 'enviando'

  return (
    <Card className="gap-4 p-4 shadow-none xl:sticky xl:top-0">
      {/* --- DESGLOSE --- */}
      <dl className="flex flex-col gap-3 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-texto-suave">Subtotal productos</dt>
          <dd className="shrink-0 font-medium whitespace-nowrap tabular-nums">{formatearMoneda(resumen.subtotalProductos)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-texto-suave">Descuento manual</dt>
          <dd className="shrink-0 font-medium whitespace-nowrap tabular-nums">
            {formatearMonedaConSigno(-resumen.montoDescuentoManual)}
          </dd>
        </div>
        {formaPago !== 'fiado' && (
          <div className="flex justify-between gap-3">
            <dt className="text-texto-suave">Descuento/recargo medio de pago</dt>
            <dd className="shrink-0 font-medium whitespace-nowrap tabular-nums">
              {formatearMonedaConSigno(resumen.montoAjusteMediosPago)}
            </dd>
          </div>
        )}
      </dl>

      {/* --- TOTAL --- */}
      <div className="flex flex-col gap-1 border-t pt-4">
        <span className="text-sm text-texto-suave">Total</span>
        <span className="text-3xl font-bold tabular-nums">{formatearMoneda(resumen.total)}</span>
      </div>

      {/* --- ESTADO DE COBERTURA (SOLO PAGO MIXTO) --- */}
      {formaPago === 'mixto' && (
        <EstadoCobertura
          faltaCubrir={resumen.faltaCubrir}
          excedente={resumen.excedente}
          onAjustarAutomaticamente={onAjustarMontosAutomaticamente}
          className="border-t pt-4"
        />
      )}

      {/* --- ACCIONES (ESCRITORIO) --- */}
      <div className="hidden flex-col gap-3 border-t pt-4 xl:flex">
        <EstadoEnvioCobro estadoEnvio={estadoEnvio} />
        <BotonConfirmarCobro
          formaPago={formaPago}
          habilitado={puedeConfirmar}
          enviando={enviando}
          onConfirmarCobro={onConfirmarCobro}
          className="w-full"
        />
        {!puedeConfirmar && motivoNoConfirmable && (
          <p role="status" className="text-center text-sm text-texto-suave tabular-nums">
            {motivoNoConfirmable}
          </p>
        )}
        <BotonCancelarVenta etiqueta="Cancelar" onCancelarVenta={onCancelarVenta} deshabilitado={enviando} />
      </div>
    </Card>
  )
}
