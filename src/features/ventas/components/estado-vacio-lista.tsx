import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

/** Props del estado vacio de una lista. */
interface EstadoVacioListaProps {
  icono: LucideIcon
  titulo: string
  descripcion: string
  /** Boton de la salida: "Limpiar filtros" o el alta del primer registro. */
  accion: ReactNode
}

/** Tarjeta centrada con icono, texto y una salida. Cada lista elige los textos de sus dos vacios. */
export function EstadoVacioLista({ icono: Icono, titulo, descripcion, accion }: EstadoVacioListaProps) {
  return (
    <Card className="items-center gap-4 px-4 py-12 text-center shadow-none">
      <span className="flex size-14 items-center justify-center rounded-full bg-fondo-suave text-texto-suave">
        <Icono aria-hidden="true" className="size-7" />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <h2 className="text-lg font-bold">{titulo}</h2>
        <p className="text-texto-suave">{descripcion}</p>
      </div>
      {accion}
    </Card>
  )
}
