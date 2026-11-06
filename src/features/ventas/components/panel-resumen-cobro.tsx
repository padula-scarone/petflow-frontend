import { Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatearMoneda, formatearMonedaConSigno } from '@/lib/formatear-moneda'
import { BotonCancelarVenta } from '@/features/ventas/components/boton-cancelar-venta'
import { BotonConfirmarCobro } from '@/features/ventas/components/boton-confirmar-cobro'
import type { FormaPago, ResumenCobro } from '@/features/ventas/types/cobro'

/** Props del panel de resumen del cobro. Los botones solo se muestran en escritorio. */
interface PanelResumenCobroProps {
  resumen: ResumenCobro
  formaPago: FormaPago
  puedeConfirmar: boolean
  motivoNoConfirmable?: string
  onConfirmarCobro: () => void
  onCancelarVenta: () => void
}

export function PanelResumenCobro({
  resumen,
  formaPago,
  puedeConfirmar,
  motivoNoConfirmable,
  onConfirmarCobro,
  onCancelarVenta,
}: PanelResumenCobroProps) {
  return (
    <Card className="gap-4 p-4 shadow-none lg:sticky lg:top-0">
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

      {/* --- FALTA CUBRIR (SOLO PAGO MIXTO) --- */}
      {formaPago === 'mixto' && (
        <div className="flex items-center justify-between gap-3 border-t pt-4">
          {resumen.faltaCubrir > 0 ? (
            <>
              <span className="text-sm text-texto-suave">Falta cubrir</span>
              <span className="font-bold text-amber-700 tabular-nums">
                {formatearMoneda(resumen.faltaCubrir)}
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1 text-sm font-medium text-green-700">
              <Check aria-hidden="true" className="size-4" />
              Total cubierto
            </span>
          )}
        </div>
      )}

      {/* --- ACCIONES (ESCRITORIO) --- */}
      <div className="hidden flex-col gap-3 border-t pt-4 lg:flex">
        <BotonConfirmarCobro
          formaPago={formaPago}
          habilitado={puedeConfirmar}
          onConfirmarCobro={onConfirmarCobro}
          className="w-full"
        />
        {!puedeConfirmar && motivoNoConfirmable && (
          <p role="status" className="text-center text-sm text-texto-suave tabular-nums">
            {motivoNoConfirmable}
          </p>
        )}
        <BotonCancelarVenta etiqueta="Cancelar" onCancelarVenta={onCancelarVenta} />
      </div>
    </Card>
  )
}
