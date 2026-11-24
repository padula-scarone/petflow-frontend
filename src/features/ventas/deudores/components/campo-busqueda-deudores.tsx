import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

/** Props del buscador de deudores por nombre o DNI. */
interface CampoBusquedaDeudoresProps {
  idCampo: string
  busqueda: string
  onCambiarBusqueda: (busqueda: string) => void
}

/** Buscador de la lista de Deudores: siempre a la vista, sin etiqueta (el placeholder y el aria-label dicen que es). */
export function CampoBusquedaDeudores({ idCampo, busqueda, onCambiarBusqueda }: CampoBusquedaDeudoresProps) {
  return (
    <div className="relative min-w-0">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-texto-suave"
      />
      <Input
        id={idCampo}
        type="text"
        autoComplete="off"
        aria-label="Buscar deudor por nombre o DNI"
        // Corto a proposito: en mobile comparte la fila con el boton de filtros
        placeholder="Nombre o DNI"
        className="bg-fondo-tarjeta pl-10"
        value={busqueda}
        onChange={(evento) => onCambiarBusqueda(evento.target.value)}
        onKeyDown={(evento) => {
          if (evento.key === 'Escape' && busqueda !== '') {
            evento.stopPropagation()
            onCambiarBusqueda('')
          }
        }}
      />
    </div>
  )
}
