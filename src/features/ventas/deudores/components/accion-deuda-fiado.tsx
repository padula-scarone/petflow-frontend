import { BotonCobrarFiado } from '@/features/ventas/components/boton-cobrar-fiado'
import { BotonVerDeuda } from '@/features/ventas/deudores/components/boton-ver-deuda'
import { COBRO_FIADO_LEGADO_ACTIVO } from '@/features/ventas/deudores/config/maqueta-deudores'
import type { FilaHistorial } from '@/features/ventas/types/historial'

/** Props de la accion de un fiado pendiente. */
interface AccionDeudaFiadoProps {
  fila: FilaHistorial
  onCobrarFiado: (idVenta: number) => void
  className?: string
}

/**
 * La accion de un fiado pendiente en el Historial. Ahora es "Ver deuda", que lleva a cobrarlo desde la ficha del
 * deudor. El "Cobrar" de antes (que liquida el fiado entero contra el back real) sigue en el codigo, detras de una
 * bandera, hasta que se integre el cobro por deudor.
 */
export function AccionDeudaFiado({ fila, onCobrarFiado, className }: AccionDeudaFiadoProps) {
  if (COBRO_FIADO_LEGADO_ACTIVO) {
    return <BotonCobrarFiado fila={fila} onCobrarFiado={onCobrarFiado} className={className} />
  }
  return <BotonVerDeuda fila={fila} className={className} />
}
