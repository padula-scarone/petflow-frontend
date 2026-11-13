import { CreditCard, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatearMoneda, formatearMonedaConSigno } from '@/lib/formatear-moneda'
import { CampoMonto } from '@/features/ventas/components/campo-monto'
import { describirAjusteMedio } from '@/features/ventas/utils/describir-ajuste-medio'
import type { LineaPagoMixto, MedioPago } from '@/features/ventas/types/cobro'

/** Props de una fila del pago mixto. */
interface FilaPagoMixtoProps {
  linea: LineaPagoMixto
  medio: MedioPago
  /** Lo que todavia falta cubrir de la venta, para ofrecer completarlo en esta linea. */
  faltaCubrir: number
  onQuitar: (idMedioPago: number) => void
  onCambiarMonto: (idMedioPago: number, monto: number | null) => void
  onCambiarPagaCon: (idMedioPago: number, monto: number | null) => void
  onCompletarConRestante: (idMedioPago: number) => void
}

export function FilaPagoMixto({
  linea,
  medio,
  faltaCubrir,
  onQuitar,
  onCambiarMonto,
  onCambiarPagaCon,
  onCompletarConRestante,
}: FilaPagoMixtoProps) {
  const Icono = medio.icono ?? CreditCard

  return (
    <Card className="gap-4 p-4 shadow-none">
      {/* --- MEDIO Y AJUSTE --- */}
      <div className="flex items-center gap-3">
        <Icono aria-hidden="true" className="size-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{medio.nombre}</p>
          <p className="text-sm text-texto-suave tabular-nums">
            {describirAjusteMedio(medio)}
            {linea.montoAjuste !== 0 && ` · ${formatearMonedaConSigno(linea.montoAjuste)}`}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Quitar ${medio.nombre}`}
          className="size-11 shrink-0 text-slate-500"
          onClick={() => onQuitar(medio.idMedioPago)}
        >
          <Trash2 />
        </Button>
      </div>

      {/* --- MONTOS --- */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <CampoMonto
            idCampo={`monto-${medio.idMedioPago}`}
            etiqueta="Monto a cubrir"
            valor={linea.montoACubrir}
            onCambiar={(monto) => onCambiarMonto(medio.idMedioPago, monto)}
          />
          {faltaCubrir > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="h-11 self-start px-3 text-sm tabular-nums"
              onClick={() => onCompletarConRestante(medio.idMedioPago)}
            >
              Sumar el restante ({formatearMoneda(faltaCubrir)})
            </Button>
          )}
        </div>

        {medio.admiteVuelto && (
          <div className="flex flex-col gap-4">
            <CampoMonto
              idCampo={`paga-con-${medio.idMedioPago}`}
              etiqueta="Paga con"
              valor={linea.pagaCon}
              onCambiar={(monto) => onCambiarPagaCon(medio.idMedioPago, monto)}
            />
            <p className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-texto-suave">Vuelto</span>
              <span className="text-lg font-bold tabular-nums">
                {formatearMoneda(linea.vuelto ?? 0)}
              </span>
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
