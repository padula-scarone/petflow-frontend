import { InsigniaEstado } from '@/features/ventas/components/insignia-estado'
import { PRESENTACION_ESTADO_VENTA } from '@/features/ventas/config/estados-venta'
import type { EstadoVentaHistorial } from '@/features/ventas/types/historial'

/** Props de la insignia con el estado de una venta. */
interface InsigniaEstadoVentaProps {
  estado: EstadoVentaHistorial
  className?: string
}

export function InsigniaEstadoVenta({ estado, className }: InsigniaEstadoVentaProps) {
  return <InsigniaEstado presentacion={PRESENTACION_ESTADO_VENTA[estado]} className={className} />
}
