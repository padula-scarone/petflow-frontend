import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Props del boton que abre el alta de un cambio. */
interface BotonCargarNuevoCambioProps {
  /** escritorio: con texto, a la derecha de la barra. mobile: icono solo hasta sm, para caber en la fila fija. */
  variante: 'escritorio' | 'mobile'
  onCargarNuevoCambio: () => void
}

export function BotonCargarNuevoCambio({ variante, onCargarNuevoCambio }: BotonCargarNuevoCambioProps) {
  if (variante === 'escritorio') {
    return (
      <Button type="button" className="h-11 gap-2 px-5" onClick={onCargarNuevoCambio}>
        <Plus />
        Cargar nuevo cambio
      </Button>
    )
  }

  return (
    // El texto accesible es el mismo en las dos variantes: el icono solo no se anuncia
    <Button
      type="button"
      aria-label="Cargar nuevo cambio"
      className="h-11 min-w-11 gap-1.5 px-0 sm:px-4"
      onClick={onCargarNuevoCambio}
    >
      <Plus />
      <span aria-hidden="true" className="hidden sm:inline">
        Nuevo cambio
      </span>
    </Button>
  )
}
