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
    <Card className="gap-bloque p-contorno xl:sticky xl:top-0">
      {/* --- DESGLOSE --- */}
      <dl className="flex flex-col gap-interno text-cuerpo">
        <div className="flex justify-between gap-interno">
          <dt className="text-texto-suave">Subtotal productos</dt>
          <dd className="shrink-0 font-medium whitespace-nowrap tabular-nums">{formatearMoneda(resumen.subtotalProductos)}</dd>
        </div>
        <div className="flex justify-between gap-interno">
          <dt className="text-texto-suave">Descuento manual</dt>
          <dd className="shrink-0 font-medium whitespace-nowrap tabular-nums">
            {formatearMonedaConSigno(-resumen.montoDescuentoManual)}
          </dd>
        </div>
        {formaPago !== 'fiado' && (
          <div className="flex justify-between gap-interno">
            <dt className="text-texto-suave">Descuento/recargo medio de pago</dt>
            <dd className="shrink-0 font-medium whitespace-nowrap tabular-nums">
              {formatearMonedaConSigno(resumen.montoAjusteMediosPago)}
            </dd>
          </div>
        )}
      </dl>

      {/* --- TOTAL --- */}
      {/* Solo desde xl: en celular el total y la cobertura estan en el pie fijo, que siempre se ve */}
      <p className="hidden items-baseline justify-between gap-interno border-t pt-bloque xl:flex">
        <span className="text-cuerpo text-texto-suave">Total</span>
        <span className="text-cifra-principal font-bold tabular-nums">{formatearMoneda(resumen.total)}</span>
      </p>

      {/* --- ESTADO DE COBERTURA (SOLO PAGO MIXTO) --- */}
      {formaPago === 'mixto' && (
        <EstadoCobertura
          faltaCubrir={resumen.faltaCubrir}
          excedente={resumen.excedente}
          onAjustarAutomaticamente={onAjustarMontosAutomaticamente}
          className="hidden border-t pt-bloque xl:flex"
        />
      )}

      {/* --- ACCIONES (ESCRITORIO) --- */}
      <div className="hidden flex-col gap-interno border-t pt-bloque xl:flex">
        <EstadoEnvioCobro estadoEnvio={estadoEnvio} />
        <BotonConfirmarCobro
          formaPago={formaPago}
          habilitado={puedeConfirmar}
          enviando={enviando}
          onConfirmarCobro={onConfirmarCobro}
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
