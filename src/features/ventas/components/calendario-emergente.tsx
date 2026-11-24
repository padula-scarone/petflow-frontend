import { useState, type ReactNode } from 'react'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { usePantallaChica } from '@/features/ventas/hooks/use-pantalla-chica'

/** Props del contenedor de un calendario que se abre desde un boton. */
interface CalendarioEmergenteProps {
  /** Titulo del cuadro en pantallas chicas; tambien es su nombre accesible. */
  titulo: string
  /** El boton que lo abre. */
  disparador: ReactNode
  /** El calendario (y lo que lo acompane). Recibe una funcion para cerrar el cuadro. */
  children: (cerrar: () => void) => ReactNode
}

/**
 * Contenedor de calendarios: en pantallas grandes es un desplegable pegado al boton; en un celular es un cuadro
 * centrado en la pantalla, con fondo oscuro y titulo. Un desplegable no siempre tiene espacio en un celular y
 * quedaba cortado; el cuadro centrado siempre se ve entero y es mas comodo de tocar.
 */
export function CalendarioEmergente({ titulo, disparador, children }: CalendarioEmergenteProps) {
  // Solo estado de presentacion: si el calendario esta abierto
  const [abierto, setAbierto] = useState(false)
  const pantallaChica = usePantallaChica()
  const cerrar = () => setAbierto(false)

  if (pantallaChica) {
    return (
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogTrigger asChild>{disparador}</DialogTrigger>
        <DialogContent
          aria-describedby={undefined}
          // El dialogo ocupa toda la pantalla por defecto: aca se achica y se centra. z-60: queda por encima de la
          // hoja de filtros (z-50) cuando se abre desde adentro
          className="inset-auto top-1/2 left-1/2 z-[60] h-auto max-h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-grande border"
        >
          <DialogHeader>
            <DialogTitle>{titulo}</DialogTitle>
          </DialogHeader>
          <DialogBody className="items-center p-2">{children(cerrar)}</DialogBody>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>{disparador}</PopoverTrigger>
      <PopoverContent className="w-auto p-2">{children(cerrar)}</PopoverContent>
    </Popover>
  )
}
