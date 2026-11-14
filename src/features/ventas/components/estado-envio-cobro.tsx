import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import {
  SEGUNDOS_ENVIO_LENTO,
  TIEMPO_LIMITE_ENVIO_SEGUNDOS,
} from '@/features/ventas/config/reglas-venta'
import type { EstadoEnvioVenta } from '@/features/ventas/types/envio-venta'

/** Props del estado del envio de la venta que se muestra junto al boton de confirmar. */
interface EstadoEnvioCobroProps {
  estadoEnvio: EstadoEnvioVenta
  className?: string
}

/**
 * Mientras la venta viaja, una barra que se llena hasta el tiempo limite del pedido; si el back la rechaza o
 * no responde, el motivo. En cualquier otro estado no muestra nada.
 */
export function EstadoEnvioCobro({ estadoEnvio, className }: EstadoEnvioCobroProps) {
  if (estadoEnvio.fase === 'enviando') {
    const { segundosTranscurridos } = estadoEnvio
    const segundosMostrados = Math.min(segundosTranscurridos, TIEMPO_LIMITE_ENVIO_SEGUNDOS)

    return (
      <div role="status" className={cn('flex flex-col gap-2', className)}>
        <p className="text-sm font-medium tabular-nums">
          Registrando la venta… {segundosTranscurridos} s
        </p>
        <div
          role="progressbar"
          aria-label="Progreso del registro de la venta"
          aria-valuemin={0}
          aria-valuemax={TIEMPO_LIMITE_ENVIO_SEGUNDOS}
          aria-valuenow={segundosMostrados}
          className="h-2 overflow-hidden rounded-full bg-fondo-suave"
        >
          <div
            className="h-full rounded-full bg-primario transition-[width] duration-1000 ease-linear"
            style={{ width: `${(segundosMostrados / TIEMPO_LIMITE_ENVIO_SEGUNDOS) * 100}%` }}
          />
        </div>
        {segundosTranscurridos >= SEGUNDOS_ENVIO_LENTO && (
          <p className="text-xs text-amber-700">
            Está tardando más de lo normal. No cierres ni toques nada.
          </p>
        )}
      </div>
    )
  }

  if (estadoEnvio.fase === 'rechazado' || estadoEnvio.fase === 'resultado-incierto') {
    return (
      <Alert variant="destructive" className={className}>
        <TriangleAlert aria-hidden="true" />
        {estadoEnvio.fase === 'resultado-incierto' && (
          <AlertTitle>No pudimos confirmar la venta</AlertTitle>
        )}
        <AlertDescription>{estadoEnvio.mensaje}</AlertDescription>
      </Alert>
    )
  }

  return null
}
