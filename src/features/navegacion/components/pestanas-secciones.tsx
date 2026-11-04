import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SeccionMenu } from '@/features/navegacion/types/menu'

/** Props de las pestanas de secciones del modulo activo. */
interface PestanasSeccionesProps {
  secciones: SeccionMenu[]
  idSeccionActiva: string
  onSeleccionarSeccion: (idSeccion: string) => void
}

export function PestanasSecciones({
  secciones,
  idSeccionActiva,
  onSeleccionarSeccion,
}: PestanasSeccionesProps) {
  return (
    // Si no entran en pantalla se desplazan en horizontal en lugar de romper el layout
    <nav aria-label="Secciones" className="flex gap-2 overflow-x-auto">
      {secciones.map((seccion) => {
        const activa = seccion.idSeccion === idSeccionActiva
        return (
          <Button
            key={seccion.idSeccion}
            type="button"
            variant="ghost"
            aria-current={activa ? 'page' : undefined}
            className={cn(
              'h-11 shrink-0 rounded-full border px-5',
              activa ? 'bg-primary-muted font-medium' : 'font-normal',
            )}
            onClick={() => onSeleccionarSeccion(seccion.idSeccion)}
          >
            {seccion.etiqueta}
          </Button>
        )
      })}
    </nav>
  )
}
