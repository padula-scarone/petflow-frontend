import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Props del boton que abre el alta de una devolución. */
interface BotonCargarNuevaDevolucionProps {
  /** escritorio: con texto, a la derecha de la barra. mobile: icono solo hasta sm, para caber en la fila fija. */
  variante: 'escritorio' | 'mobile'
  onCargarNuevaDevolucion: () => void
}

export function BotonCargarNuevaDevolucion({ variante, onCargarNuevaDevolucion }: BotonCargarNuevaDevolucionProps) {
  if (variante === 'escritorio') {
    return (
      <Button type="button" className="gap-2" onClick={onCargarNuevaDevolucion}>
        <Plus />
        Cargar nueva devolución
      </Button>
    )
  }

  return (
    // El texto accesible es el mismo en las dos variantes: el icono solo no se anuncia
    <Button
      type="button"
      aria-label="Cargar nueva devolución"
      className="min-w-control gap-1.5 px-0 sm:px-4"
      onClick={onCargarNuevaDevolucion}
    >
      <Plus />
      <span aria-hidden="true" className="hidden sm:inline">
        Nueva devolución
      </span>
    </Button>
  )
}
