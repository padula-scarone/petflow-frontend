import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatearFechaHora } from '@/lib/formatear-fecha-hora'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { AccionesVentaHistorial } from '@/features/ventas/components/acciones-venta-historial'
import { AvisoVentanaVenta } from '@/features/ventas/components/aviso-ventana-venta'
import { BotonCobrarFiado } from '@/features/ventas/components/boton-cobrar-fiado'
import { InsigniaEstadoVenta } from '@/features/ventas/components/insignia-estado-venta'
import type { FilaHistorial, PropiedadesAccionesVenta } from '@/features/ventas/types/historial'
import { describirEntrega, describirOrigen } from '@/features/ventas/utils/describir-origen-entrega'

/** Props de la tarjeta de una venta (mobile y pantallas medianas). */
interface TarjetaVentaHistorialProps {
  fila: FilaHistorial
  acciones: PropiedadesAccionesVenta
}

export function TarjetaVentaHistorial({ fila, acciones }: TarjetaVentaHistorialProps) {
  return (
    // h-full + mt-auto en el total: las tarjetas de una misma fila de la grilla igualan alto
    <Card className="h-full min-w-0 gap-3 p-4 shadow-none">
      {/* --- COMPROBANTE, CLIENTE (SI EXISTE) Y ESTADO --- */}
      {/* flex-wrap: en 320 px el estado baja a su propia linea en vez de cortarse */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 max-w-full">
          <p className="text-xs text-texto-suave">N.º de comprobante</p>
          <p className="font-bold tabular-nums">{fila.numeroComprobante}</p>
          {fila.clienteReferencia !== null && (
            <p className="truncate text-sm text-texto-suave">Cliente: {fila.clienteReferencia}</p>
          )}
        </div>
        <InsigniaEstadoVenta estado={fila.estado} />
      </div>

      {/* --- FECHA, ORIGEN Y ENTREGA --- */}
      <div className="flex flex-col gap-0.5 text-sm text-texto-suave tabular-nums">
        <p>{formatearFechaHora(fila.fechaHora)}</p>
        <p>
          Origen: {describirOrigen(fila.origen)} · Entrega: {describirEntrega(fila.modalidadEntrega)}
        </p>
      </div>

      <AvisoVentanaVenta fila={fila} />

      {/* --- TOTAL, Y COBRAR AL LADO SOLO EN UN FIADO --- */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t pt-3">
        <p className="flex flex-col">
          <span className="text-xs text-texto-suave">Total</span>
          <span
            className={cn(
              'text-xl font-bold tabular-nums',
              fila.estado === 'ANULADA' && 'font-normal text-texto-suave',
            )}
          >
            {formatearMoneda(fila.montoTotal)}
          </span>
        </p>
        <BotonCobrarFiado fila={fila} onCobrarFiado={acciones.onCobrarFiado} />
      </div>

      <AccionesVentaHistorial fila={fila} acciones={acciones} variante="tarjeta" />
    </Card>
  )
}
