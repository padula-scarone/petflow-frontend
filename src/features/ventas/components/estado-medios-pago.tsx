import { Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { EstadoErrorLista } from '@/features/ventas/components/estado-error-lista'
import type { EstadoCargaRecurso } from '@/features/ventas/types/carga'

/** Props del aviso sobre la carga de los medios de pago. */
interface EstadoMediosPagoProps {
  estadoMediosPago: EstadoCargaRecurso
  cantidadMedios: number
  onReintentar: () => void
}

/** Muestra la carga, el error o la falta de medios de pago; con medios disponibles no muestra nada. */
export function EstadoMediosPago({
  estadoMediosPago,
  cantidadMedios,
  onReintentar,
}: EstadoMediosPagoProps) {
  if (estadoMediosPago.fase === 'cargando') {
    return (
      <div role="status" aria-busy="true">
        <span className="sr-only">Cargando medios de pago</span>
        <Skeleton className="h-11 w-full" />
      </div>
    )
  }

  if (estadoMediosPago.fase === 'error') {
    return (
      <EstadoErrorLista
        titulo="No se pudieron cargar los medios de pago"
        mensaje={estadoMediosPago.mensajeError ?? ''}
        onReintentar={onReintentar}
      />
    )
  }

  if (cantidadMedios === 0) {
    return (
      <Alert>
        <Info aria-hidden="true" />
        <AlertDescription>
          No hay medios de pago activos. Por ahora solo se puede registrar la venta como fiado.
        </AlertDescription>
      </Alert>
    )
  }

  return null
}
