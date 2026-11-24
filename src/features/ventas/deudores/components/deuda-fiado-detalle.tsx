import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { describirFechaEstimada } from '@/features/ventas/deudores/utils/fechas-estimadas'
import type { EstadoDeudaFiadoDetalle } from '@/features/ventas/types/historial'

/** Props del bloque con la deuda de un fiado pendiente, dentro del detalle de la venta. */
interface DeudaFiadoDetalleProps {
  /** AAAA-MM-DD; null = "Sin fecha". */
  fechaEstimadaPago: string | null
  /** Lo pagado y lo que falta salen de la ficha del deudor: ni la lista ni el detalle de la venta lo traen. */
  deudaFiado: EstadoDeudaFiadoDetalle | null
  onReintentar: () => void
}

/** La deuda de un fiado pendiente con deudor: para cuando se estima el pago y cuanto falta, con su carga y su error. */
export function DeudaFiadoDetalle({ fechaEstimadaPago, deudaFiado, onReintentar }: DeudaFiadoDetalleProps) {
  return (
    <section aria-labelledby="titulo-deuda-fiado" className="flex flex-col gap-interno">
      <h2 id="titulo-deuda-fiado" className="text-titulo-seccion font-bold">
        Estado de la deuda
      </h2>
      <dl className="grid grid-cols-2 gap-x-bloque gap-y-interno text-cuerpo">
        <div className="col-span-2">
          <dt className="text-texto-suave">Fecha estimada de pago</dt>
          <dd className="font-medium tabular-nums">{describirFechaEstimada(fechaEstimadaPago)}</dd>
        </div>
        {deudaFiado?.tipo === 'listo' && (
          <>
            <div>
              <dt className="text-texto-suave">Ya pagado</dt>
              <dd className="font-medium tabular-nums">{formatearMoneda(deudaFiado.montoPagado)}</dd>
            </div>
            <div>
              <dt className="text-texto-suave">Falta</dt>
              <dd className="font-bold tabular-nums">{formatearMoneda(deudaFiado.montoFaltante)}</dd>
            </div>
          </>
        )}
      </dl>
      {deudaFiado?.tipo === 'cargando' && (
        <div role="status" aria-busy="true" className="flex flex-col gap-interno">
          <span className="sr-only">Cargando lo que falta pagar</span>
          <Skeleton className="h-10 w-full" />
        </div>
      )}
      {deudaFiado?.tipo === 'error' && (
        <div role="alert" className="flex flex-col items-start gap-interno text-cuerpo text-peligro">
          <span className="flex items-start gap-2">
            <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {deudaFiado.mensaje}
          </span>
          <Button type="button" variant="outline" className="bg-fondo-tarjeta text-texto-principal" onClick={onReintentar}>
            Reintentar
          </Button>
        </div>
      )}
      {deudaFiado?.tipo === 'fuera-de-la-cuenta' && (
        <p role="status" className="text-cuerpo text-texto-suave">
          Este fiado ya no figura entre los pendientes del deudor: se cobró por completo.
        </p>
      )}
    </section>
  )
}
