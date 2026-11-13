import { Card } from '@/components/ui/card'
import {
  AccionesCambio,
  ArticuloDevueltoFila,
  ArticuloEntregadoFila,
  AvisoVentanaCambio,
  InsigniaEstadoCambio,
  TextoVentaVinculada,
} from '@/features/ventas/cambios-mercaderia/components/piezas-fila-cambio'
import { SaldoCambio } from '@/features/ventas/cambios-mercaderia/components/saldo-cambio'
import type { FilaCambio, PropiedadesAccionesCambio } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { formatearFechaHora } from '@/lib/formatear-fecha-hora'

/** Props de la tarjeta de un cambio (mobile y pantallas medianas). */
interface TarjetaCambioProps {
  fila: FilaCambio
  acciones: PropiedadesAccionesCambio
}

export function TarjetaCambio({ fila, acciones }: TarjetaCambioProps) {
  return (
    // h-full + mt-auto en el saldo: las tarjetas de una misma fila de la grilla igualan alto
    <Card className="h-full min-w-0 gap-3 p-4 shadow-none">
      {/* --- FECHA Y HORA, VENTA VINCULADA Y ESTADO --- */}
      {/* flex-wrap: en 320 px el estado baja a su propia linea en vez de cortarse */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 max-w-full">
          <p className="font-bold tabular-nums">{formatearFechaHora(fila.fechaHora)}</p>
          <p className="truncate text-sm text-texto-suave">
            Venta: <TextoVentaVinculada fila={fila} className="text-sm" />
          </p>
        </div>
        <InsigniaEstadoCambio estado={fila.estado} />
      </div>

      {/* --- DEVUELTO Y ENTREGADO --- */}
      <dl className="grid gap-2 text-sm">
        <div className="min-w-0">
          <dt className="text-xs text-texto-suave">Devuelve</dt>
          <dd>
            <ArticuloDevueltoFila fila={fila} />
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-texto-suave">Entrega</dt>
          <dd>
            <ArticuloEntregadoFila fila={fila} />
          </dd>
        </div>
      </dl>

      <AvisoVentanaCambio fila={fila} />

      {/* --- SALDO, A LA DERECHA --- */}
      <div className="mt-auto flex items-end justify-between gap-3 border-t pt-3">
        <p className="min-w-0 truncate text-xs text-texto-suave">
          {fila.nombreMedioPago ? `Cobrado con ${fila.nombreMedioPago}` : 'Sin diferencia a cobrar'}
        </p>
        <p className="flex shrink-0 flex-col items-end">
          <span className="text-xs text-texto-suave">Saldo</span>
          <SaldoCambio saldo={fila.saldoResultante} anulado={fila.estado === 'ANULADO'} className="text-xl" />
        </p>
      </div>

      <AccionesCambio fila={fila} acciones={acciones} variante="tarjeta" />
    </Card>
  )
}
