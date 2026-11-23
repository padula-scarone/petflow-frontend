import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { FechaEstimadaPago } from '@/features/ventas/deudores/types/pago-con-deuda'
import { obtenerFechaHoy } from '@/features/ventas/deudores/utils/fechas-estimadas'
import {
  formatearFechaCalendario,
  parsearFechaCalendario,
} from '@/features/ventas/utils/calcular-periodo-rapido'
import { formatearFechaCalendarioLegible } from '@/features/ventas/utils/formatear-fecha-calendario-legible'

/** Props del selector de la fecha estimada de pago. */
interface SelectorFechaEstimadaProps {
  /** null = todavia no decidio. */
  fechaEstimada: FechaEstimadaPago | null
  onCambiarFechaEstimada: (fecha: FechaEstimadaPago | null) => void
}

const CLASE_OPCION = 'flex-1 justify-center bg-fondo-tarjeta sm:flex-none sm:min-w-40'
const CLASE_OPCION_ELEGIDA = 'border-texto-principal bg-fondo-seleccion font-bold hover:bg-fondo-seleccion'

/**
 * Fecha estimada de pago de la deuda. Es obligatorio decidir: una fecha del calendario (nunca pasada) o "Sin fecha".
 * Dos botones y no un desplegable: son las dos unicas respuestas y se ven a la vez.
 */
export function SelectorFechaEstimada({ fechaEstimada, onCambiarFechaEstimada }: SelectorFechaEstimadaProps) {
  // Solo estado de presentacion: si el calendario esta abierto
  const [calendarioAbierto, setCalendarioAbierto] = useState(false)
  const hoy = parsearFechaCalendario(obtenerFechaHoy())
  const fechaElegida = fechaEstimada?.modo === 'fecha' ? fechaEstimada.fecha : null
  const sinFecha = fechaEstimada?.modo === 'sin-fecha'

  return (
    <div className="flex flex-col gap-interno">
      <span id="etiqueta-fecha-estimada" className="text-cuerpo text-texto-suave">
        Fecha estimada de pago
      </span>
      <div role="group" aria-labelledby="etiqueta-fecha-estimada" className="flex flex-wrap gap-interno">
        <Popover open={calendarioAbierto} onOpenChange={setCalendarioAbierto}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              aria-pressed={fechaElegida !== null}
              className={cn(CLASE_OPCION, fechaElegida !== null && CLASE_OPCION_ELEGIDA)}
            >
              <CalendarDays aria-hidden="true" />
              <span className="tabular-nums">
                {fechaElegida === null ? 'Elegir fecha' : formatearFechaCalendarioLegible(fechaElegida)}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <Calendar
              mode="single"
              defaultMonth={fechaElegida ? parsearFechaCalendario(fechaElegida) : hoy}
              selected={fechaElegida ? parsearFechaCalendario(fechaElegida) : undefined}
              // Nunca una fecha pasada: no tiene sentido estimar un pago para ayer
              disabled={{ before: hoy }}
              classNames={{ selected: 'rounded-mediano bg-primario text-texto-sobre-primario' }}
              onSelect={(fecha) => {
                if (!fecha) return
                onCambiarFechaEstimada({ modo: 'fecha', fecha: formatearFechaCalendario(fecha) })
                // Elegir un dia cierra el calendario: no hay nada mas que decidir
                setCalendarioAbierto(false)
              }}
            />
          </PopoverContent>
        </Popover>

        <Button
          type="button"
          variant="outline"
          aria-pressed={sinFecha}
          className={cn(CLASE_OPCION, sinFecha && CLASE_OPCION_ELEGIDA)}
          onClick={() => onCambiarFechaEstimada({ modo: 'sin-fecha' })}
        >
          Sin fecha
        </Button>
      </div>
    </div>
  )
}
