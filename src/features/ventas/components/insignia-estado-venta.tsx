import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { PRESENTACION_ESTADO_VENTA } from '@/features/ventas/config/estados-venta'
import type { EstadoVentaHistorial } from '@/features/ventas/types/historial'

/** Props de la insignia con el estado de una venta. */
interface InsigniaEstadoVentaProps {
  estado: EstadoVentaHistorial
  className?: string
}

export function InsigniaEstadoVenta({ estado, className }: InsigniaEstadoVentaProps) {
  const { etiqueta, icono: Icono, claseInsignia } = PRESENTACION_ESTADO_VENTA[estado]

  return (
    <Badge variant="outline" className={cn('h-7 gap-1.5 px-3 text-sm', claseInsignia, className)}>
      <Icono aria-hidden="true" />
      {etiqueta}
    </Badge>
  )
}
