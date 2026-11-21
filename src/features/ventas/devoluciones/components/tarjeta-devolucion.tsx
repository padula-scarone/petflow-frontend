import { Card } from '@/components/ui/card'
import {
  AccionesDevolucion,
  ArticuloDevueltoFila,
  ArticuloEntregadoFila,
  AvisoVentanaDevolucion,
  InsigniaEstadoDevolucion,
  TextoVentaVinculada,
} from '@/features/ventas/devoluciones/components/piezas-fila-devolucion'
import { SaldoDevolucion } from '@/features/ventas/devoluciones/components/saldo-devolucion'
import type { FilaDevolucion, PropiedadesAccionesDevolucion } from '@/features/ventas/devoluciones/types/devolucion'
import { formatearFechaHora } from '@/lib/formatear-fecha-hora'

/** Props de la tarjeta de una devolución (mobile y pantallas medianas). */
interface TarjetaDevolucionProps {
  fila: FilaDevolucion
  acciones: PropiedadesAccionesDevolucion
}

export function TarjetaDevolucion({ fila, acciones }: TarjetaDevolucionProps) {
  return (
    // h-full + mt-auto en el saldo: las tarjetas de una misma fila de la grilla igualan alto
    <Card className="h-full min-w-0 gap-interno p-contorno">
      {/* --- FECHA Y HORA, VENTA VINCULADA Y ESTADO --- */}
      {/* flex-wrap: en 320 px el estado baja a su propia linea en vez de cortarse */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 max-w-full">
          <p className="font-bold tabular-nums">{formatearFechaHora(fila.fechaHora)}</p>
          <p className="truncate text-cuerpo text-texto-suave">
            Venta: <TextoVentaVinculada fila={fila} className="text-cuerpo" />
          </p>
        </div>
        <InsigniaEstadoDevolucion estado={fila.estado} />
      </div>

      {/* --- DEVUELTO Y ENTREGADO --- */}
      <dl className="grid gap-2 text-cuerpo">
        <div className="min-w-0">
          <dt className="text-auxiliar text-texto-suave">Devuelve</dt>
          <dd>
            <ArticuloDevueltoFila fila={fila} />
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-auxiliar text-texto-suave">Entrega</dt>
          <dd>
            <ArticuloEntregadoFila fila={fila} />
          </dd>
        </div>
      </dl>

      <AvisoVentanaDevolucion fila={fila} />

      {/* --- SALDO, A LA DERECHA --- */}
      <div className="mt-auto flex items-end justify-between gap-interno border-t pt-interno">
        <p className="min-w-0 truncate text-auxiliar text-texto-suave">
          {fila.nombreMedioPago ? `Cobrado con ${fila.nombreMedioPago}` : 'Sin diferencia a cobrar'}
        </p>
        <p className="flex shrink-0 flex-col items-end">
          <span className="text-auxiliar text-texto-suave">Saldo</span>
          <SaldoDevolucion saldo={fila.saldoResultante} anulado={fila.estado === 'ANULADO'} className="text-cifra-secundaria" />
        </p>
      </div>

      <AccionesDevolucion fila={fila} acciones={acciones} variante="tarjeta" />
    </Card>
  )
}
