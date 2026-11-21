import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { VentaVinculable } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { describirOrigen } from '@/features/ventas/utils/describir-origen-entrega'
import { formatearFechaHora } from '@/lib/formatear-fecha-hora'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props de una venta de los resultados de la busqueda. */
interface TarjetaVentaVinculableProps {
  venta: VentaVinculable
  /** Venta cuyo detalle se esta trayendo; null si ninguna. Mientras tanto no se puede elegir otra. */
  idVentaVinculando: number | null
  onVincularVenta: (idVenta: number) => void
}

export function TarjetaVentaVinculable({ venta, idVentaVinculando, onVincularVenta }: TarjetaVentaVinculableProps) {
  const vinculando = idVentaVinculando === venta.idVenta

  return (
    <Card className="min-w-0 flex-col gap-interno p-contorno sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-bold tabular-nums">{venta.numeroComprobante}</p>
        <p className="text-cuerpo text-texto-suave tabular-nums">
          {formatearFechaHora(venta.fechaHora)} · {describirOrigen(venta.origen)}
        </p>
        <p className="text-cuerpo tabular-nums">
          Total <span className="font-medium">{formatearMoneda(venta.montoTotal)}</span>
        </p>
        {venta.cantidadCambiosActivos > 0 && (
          <p className="text-auxiliar text-texto-suave">
            Ya tuvo {venta.cantidadCambiosActivos} {venta.cantidadCambiosActivos === 1 ? 'cambio' : 'cambios'}
          </p>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        aria-label={`Vincular la venta ${venta.numeroComprobante}`}
        className="shrink-0 bg-fondo-tarjeta"
        disabled={idVentaVinculando !== null}
        onClick={() => onVincularVenta(venta.idVenta)}
      >
        {vinculando ? 'Cargando…' : 'Vincular'}
      </Button>
    </Card>
  )
}
