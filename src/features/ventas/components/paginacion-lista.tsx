import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'

/** Props de la paginacion de una lista. */
interface PaginacionListaProps {
  paginacion: PaginacionResultados
  onCambiarPagina: (pagina: number) => void
}

export function PaginacionLista({ paginacion, onCambiarPagina }: PaginacionListaProps) {
  const { pagina, totalPaginas } = paginacion
  // Con una sola pagina no hay nada que paginar
  if (totalPaginas <= 1) return null

  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-interno">
      <Button
        type="button"
        variant="outline"
        className="gap-1 bg-fondo-tarjeta"
        disabled={pagina <= 1}
        onClick={() => onCambiarPagina(pagina - 1)}
      >
        <ChevronLeft />
        Anterior
      </Button>
      {/* "1/2" alcanza: entre Anterior y Siguiente no se lee de otra manera, y ocupa lo justo. Para el lector de
          pantalla queda dicho completo */}
      <p className="text-cuerpo tabular-nums">
        <span className="sr-only">
          Página {pagina} de {totalPaginas}
        </span>
        <span aria-hidden="true">
          <span className="font-bold">{pagina}</span>/{totalPaginas}
        </span>
      </p>
      <Button
        type="button"
        variant="outline"
        className="gap-1 bg-fondo-tarjeta"
        disabled={pagina >= totalPaginas}
        onClick={() => onCambiarPagina(pagina + 1)}
      >
        Siguiente
        <ChevronRight />
      </Button>
    </nav>
  )
}
