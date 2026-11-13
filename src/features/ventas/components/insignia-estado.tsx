import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PresentacionEstado } from '@/features/ventas/types/compartidos'

/** Props de la insignia de un estado. */
interface InsigniaEstadoProps {
  presentacion: PresentacionEstado
  className?: string
}

/** Insignia con icono y texto; cada modulo le pasa la presentacion de sus estados. */
export function InsigniaEstado({ presentacion, className }: InsigniaEstadoProps) {
  const { etiqueta, icono: Icono, claseInsignia } = presentacion

  return (
    <Badge variant="outline" className={cn('h-7 gap-1.5 px-3 text-sm', claseInsignia, className)}>
      <Icono aria-hidden="true" />
      {etiqueta}
    </Badge>
  )
}
