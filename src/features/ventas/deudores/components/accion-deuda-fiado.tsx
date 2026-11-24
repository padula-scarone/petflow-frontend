import { BotonVerDeuda } from '@/features/ventas/deudores/components/boton-ver-deuda'
import type { FilaHistorial } from '@/features/ventas/types/historial'

/** Props de la accion de un fiado pendiente. */
interface AccionDeudaFiadoProps {
  fila: FilaHistorial
  className?: string
}

/** La accion de un fiado pendiente en el Historial: "Ver deuda", que lleva a cobrarlo desde la ficha del deudor. */
export function AccionDeudaFiado({ fila, className }: AccionDeudaFiadoProps) {
  return <BotonVerDeuda fila={fila} className={className} />
}
