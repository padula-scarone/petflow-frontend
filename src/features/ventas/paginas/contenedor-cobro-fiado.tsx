import { DialogoCobroFiado } from '@/features/ventas/components/dialogo-cobro-fiado'
import { useLiquidarFiado } from '@/features/ventas/hooks/use-liquidar-fiado'
import type { EstadoCargaRecurso } from '@/features/ventas/types/carga'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type { FilaHistorial } from '@/features/ventas/types/historial'

/** Props del contenedor del cobro de un fiado. */
interface ContenedorCobroFiadoProps {
  fila: FilaHistorial
  medios: MedioPago[]
  estadoMediosPago: EstadoCargaRecurso
  onReintentarMediosPago: () => void
  onCerrar: () => void
  onVerRecibo: () => void
  onActualizarListado: () => void
  /** El cobro se aplico o la venta cambio en el servidor: hay que volver a pedir la lista. */
  alCambiarVenta: () => void
}

/**
 * Dueno del estado del cobro de un fiado. Se monta con key={idVenta}: cada fiado arranca
 * con el medio de pago, el monto recibido y el resultado en blanco.
 */
export function ContenedorCobroFiado({
  fila,
  medios,
  estadoMediosPago,
  onReintentarMediosPago,
  onCerrar,
  onVerRecibo,
  onActualizarListado,
  alCambiarVenta,
}: ContenedorCobroFiadoProps) {
  const cobroFiado = useLiquidarFiado({
    fila,
    medios,
    estadoMediosPago,
    onReintentarMediosPago,
    alCambiarVenta,
  })

  return (
    <DialogoCobroFiado
      {...cobroFiado}
      onCerrar={onCerrar}
      onVerRecibo={onVerRecibo}
      onActualizarListado={onActualizarListado}
    />
  )
}
