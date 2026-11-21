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
    // Si no entran en pantalla se desplazan en horizontal en lugar de romper el layout.
    // El margen lateral es relleno de la propia nav (px-contorno) y no del contenedor: asi la zona que se
    // desplaza llega hasta el borde de la pantalla y las pestanas se cortan ahi, no un contorno antes.
    // En PC el mismo relleno las alinea con el contenido de la pagina
    <nav
      aria-label="Secciones"
      className="sin-barra-desplazamiento flex gap-interno overflow-x-auto px-contorno"
    >
      {secciones.map((seccion) => {
        const activa = seccion.idSeccion === idSeccionActiva
        return (
          <Button
            key={seccion.idSeccion}
            type="button"
            variant="ghost"
            aria-current={activa ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-full border border-borde-campo',
              activa ? 'bg-fondo-seleccion font-medium hover:bg-fondo-seleccion' : 'bg-fondo-tarjeta font-normal',
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
