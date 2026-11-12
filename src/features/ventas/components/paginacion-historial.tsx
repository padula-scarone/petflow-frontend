import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PaginacionHistorial as DatosPaginacion } from '@/features/ventas/types/historial'

/** Props de la paginacion del historial. */
interface PaginacionHistorialProps {
  paginacion: DatosPaginacion
  onCambiarPagina: (pagina: number) => void
}

export function PaginacionHistorial({ paginacion, onCambiarPagina }: PaginacionHistorialProps) {
  const { pagina, totalPaginas } = paginacion
  // Con una sola pagina no hay nada que paginar
  if (totalPaginas <= 1) return null

  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-3">
      <Button
        type="button"
        variant="outline"
        className="h-11 gap-1 bg-fondo-tarjeta px-4"
        disabled={pagina <= 1}
        onClick={() => onCambiarPagina(pagina - 1)}
      >
        <ChevronLeft />
        Anterior
      </Button>
      <p className="text-sm tabular-nums">
        Página <span className="font-bold">{pagina}</span> de {totalPaginas}
      </p>
      <Button
        type="button"
        variant="outline"
        className="h-11 gap-1 bg-fondo-tarjeta px-4"
        disabled={pagina >= totalPaginas}
        onClick={() => onCambiarPagina(pagina + 1)}
      >
        Siguiente
        <ChevronRight />
      </Button>
    </nav>
  )
}
