import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatearMoneda, formatearMonedaConSigno } from '@/lib/formatear-moneda'
import { BotonConfirmarCobro } from '@/features/ventas/components/boton-confirmar-cobro'
import { EstadoCobertura } from '@/features/ventas/components/estado-cobertura'
import type { EstadoCobro } from '@/features/ventas/types/cobro'

/** Props del resumen del cobro de fiados. Los botones solo se muestran en escritorio. */
interface PanelResumenCobroDeudorProps {
  estadoCobro: EstadoCobro
  /** Suma de lo que se abona a los fiados, antes de los ajustes de los medios. */
  totalACobrar: number
  enviando: boolean
  /** Falso cuando el rechazo no tiene arreglo aca (un fiado cambio): solo queda volver a la ficha. */
  puedeReintentar: boolean
  onConfirmarCobro: () => void
  onVolverALaFicha: () => void
  onAjustarMontosAutomaticamente: () => void
}

/** Columna derecha del cobro, como el resumen de Registrar Venta: lo que se abona, el ajuste del medio y el total. */
export function PanelResumenCobroDeudor({
  estadoCobro,
  totalACobrar,
  enviando,
  puedeReintentar,
  onConfirmarCobro,
  onVolverALaFicha,
  onAjustarMontosAutomaticamente,
}: PanelResumenCobroDeudorProps) {
  const { resumen, formaPago, puedeConfirmar } = estadoCobro

  return (
    <Card className="gap-bloque p-contorno xl:sticky xl:top-0">
      {/* --- DESGLOSE --- */}
      <dl className="flex flex-col gap-interno text-cuerpo">
        <div className="flex justify-between gap-interno">
          <dt className="text-texto-suave">Fiados a cobrar</dt>
          <dd className="shrink-0 font-medium whitespace-nowrap tabular-nums">{formatearMoneda(totalACobrar)}</dd>
        </div>
        <div className="flex justify-between gap-interno">
          <dt className="text-texto-suave">Descuento/recargo medio de pago</dt>
          <dd className="shrink-0 font-medium whitespace-nowrap tabular-nums">
            {formatearMonedaConSigno(resumen.montoAjusteMediosPago)}
          </dd>
        </div>
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
        {puedeReintentar && (
          <BotonConfirmarCobro
            formaPago={formaPago}
            habilitado={puedeConfirmar && !enviando}
            enviando={enviando}
            onConfirmarCobro={onConfirmarCobro}
            className="w-full"
          />
        )}
        <Button
          type="button"
          variant="outline"
          className="w-full bg-fondo-tarjeta"
          disabled={enviando}
          onClick={onVolverALaFicha}
        >
          {puedeReintentar ? 'Cancelar' : 'Volver a la ficha'}
        </Button>
      </div>
    </Card>
  )
}
