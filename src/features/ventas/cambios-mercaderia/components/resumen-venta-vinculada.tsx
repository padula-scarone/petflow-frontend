import { Link2Off } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { VentaVinculada } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { describirOrigen } from '@/features/ventas/utils/describir-origen-entrega'
import { formatearFechaHora } from '@/lib/formatear-fecha-hora'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props del resumen de la venta vinculada. */
interface ResumenVentaVinculadaProps {
  venta: VentaVinculada
  onDesvincularVenta: () => void
  /** Texto del boton que quita el vinculo. */
  etiquetaQuitar: string
}

/** Comprobante, fecha, origen y total de la venta elegida, con la salida para quitar el vinculo. */
export function ResumenVentaVinculada({ venta, onDesvincularVenta, etiquetaQuitar }: ResumenVentaVinculadaProps) {
  return (
    <Card className="flex-col gap-3 p-3 shadow-none sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs text-texto-suave">Venta vinculada</p>
        <p className="font-bold tabular-nums">{venta.numeroComprobante}</p>
        <p className="text-sm text-texto-suave tabular-nums">
          {formatearFechaHora(venta.fechaHora)} · {describirOrigen(venta.origen)} · Total{' '}
          {formatearMoneda(venta.montoTotal)}
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-11 shrink-0 gap-1.5 bg-fondo-tarjeta px-4"
        onClick={onDesvincularVenta}
      >
        <Link2Off />
        {etiquetaQuitar}
      </Button>
    </Card>
  )
}
