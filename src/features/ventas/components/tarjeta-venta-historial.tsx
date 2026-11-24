import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatearFechaHora } from '@/lib/formatear-fecha-hora'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { AccionesVentaHistorial } from '@/features/ventas/components/acciones-venta-historial'
import { AvisoVentanaVenta } from '@/features/ventas/components/aviso-ventana-venta'
import { InsigniaEstadoVenta } from '@/features/ventas/components/insignia-estado-venta'
import { AccionDeudaFiado } from '@/features/ventas/deudores/components/accion-deuda-fiado'
import { AvisoFaltanteFiado } from '@/features/ventas/deudores/components/aviso-faltante-fiado'
import type { FilaHistorial, PropiedadesAccionesVenta } from '@/features/ventas/types/historial'
import { describirEntrega, describirOrigen } from '@/features/ventas/utils/describir-origen-entrega'
import { obtenerNombreDeudor } from '@/features/ventas/utils/obtener-nombre-deudor'

/** Props de la tarjeta de una venta (mobile y pantallas medianas). */
interface TarjetaVentaHistorialProps {
  fila: FilaHistorial
  acciones: PropiedadesAccionesVenta
}

export function TarjetaVentaHistorial({ fila, acciones }: TarjetaVentaHistorialProps) {
  return (
    // h-full + mt-auto en el total: las tarjetas de una misma fila de la grilla igualan alto
    <Card className="h-full min-w-0 gap-interno p-contorno">
      {/* --- COMPROBANTE, DEUDOR (SI HAY DEUDA) Y ESTADO --- */}
      {/* flex-wrap: en 320 px el estado baja a su propia linea en vez de cortarse */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 max-w-full">
          <p className="text-auxiliar text-texto-suave">N.º de comprobante</p>
          <p className="font-bold tabular-nums">{fila.numeroComprobante}</p>
          {obtenerNombreDeudor(fila) !== null && (
            <p className="truncate text-cuerpo text-texto-suave">Deudor: {obtenerNombreDeudor(fila)}</p>
          )}
        </div>
        <InsigniaEstadoVenta estado={fila.estado} />
      </div>

      {/* --- FECHA, ORIGEN Y ENTREGA --- */}
      <div className="flex flex-col gap-0.5 text-cuerpo text-texto-suave tabular-nums">
        <p>{formatearFechaHora(fila.fechaHora)}</p>
        <p>
          Origen: {describirOrigen(fila.origen)} · Entrega: {describirEntrega(fila.modalidadEntrega)}
        </p>
      </div>

      <AvisoVentanaVenta fila={fila} />

      {/* --- TOTAL, Y AL LADO "VER DEUDA" SOLO EN UN FIADO --- */}
      <div className="mt-auto flex items-center justify-between gap-interno border-t pt-interno">
        {/* El total va a la derecha, como en la tabla; en un fiado el boton Ver deuda pasa a su izquierda */}
        <p className="order-2 ml-auto flex flex-col items-end">
          <span className="text-auxiliar text-texto-suave">Total</span>
          <span
            className={cn(
              'text-cifra-secundaria font-bold tabular-nums',
              fila.estado === 'ANULADA' && 'font-normal text-texto-suave',
            )}
          >
            {formatearMoneda(fila.montoTotal)}
          </span>
          <AvisoFaltanteFiado fila={fila} />
        </p>
        <div className="order-1">
          <AccionDeudaFiado fila={fila} />
        </div>
      </div>

      <AccionesVentaHistorial fila={fila} acciones={acciones} variante="tarjeta" />
    </Card>
  )
}
