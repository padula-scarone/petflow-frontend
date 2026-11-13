import { DialogoCobroFiado } from '@/features/ventas/components/dialogo-cobro-fiado'
import { useLiquidarFiadoEjemplo } from '@/features/ventas/hooks/use-liquidar-fiado-ejemplo'
import type { FilaHistorial, LiquidarFiadoServidor } from '@/features/ventas/types/historial'

/** Props del contenedor del cobro de un fiado. */
interface ContenedorCobroFiadoProps {
  fila: FilaHistorial
  liquidarFiado: LiquidarFiadoServidor
  onCerrar: () => void
  onVerRecibo: () => void
  onActualizarListado: () => void
}

/**
 * Dueno del estado del cobro de un fiado. Se monta con key={idVenta}: cada fiado arranca
 * con el medio de pago, el monto recibido y el resultado en blanco.
 */
export function ContenedorCobroFiado({
  fila,
  liquidarFiado,
  onCerrar,
  onVerRecibo,
  onActualizarListado,
}: ContenedorCobroFiadoProps) {
  const cobroFiado = useLiquidarFiadoEjemplo({ fila, liquidarFiado })

  return (
    <DialogoCobroFiado
      {...cobroFiado}
      onCerrar={onCerrar}
      onVerRecibo={onVerRecibo}
      onActualizarListado={onActualizarListado}
    />
  )
}
