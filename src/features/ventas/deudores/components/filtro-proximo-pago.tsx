import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FiltroSelector } from '@/features/ventas/components/filtro-selector'
import type { OpcionProximoPago } from '@/features/ventas/deudores/types/cuenta-corriente'
import { obtenerFechaHoy } from '@/features/ventas/deudores/utils/fechas-estimadas'
import type { OpcionSelector } from '@/features/ventas/types/compartidos'
import {
  formatearFechaCalendario,
  parsearFechaCalendario,
} from '@/features/ventas/utils/calcular-periodo-rapido'
import { formatearFechaCalendarioLegible } from '@/features/ventas/utils/formatear-fecha-calendario-legible'

/** Props del filtro por proximo pago. */
interface FiltroProximoPagoProps {
  idCampo: string
  proximoPago: OpcionProximoPago | null
  /** AAAA-MM-DD; null = todavia no eligio el dia. */
  fechaProximoPago: string | null
  onCambiarProximoPago: (proximoPago: OpcionProximoPago | null) => void
  onCambiarFechaProximoPago: (fecha: string) => void
}

// El valor se lee solo en el control, sin etiqueta visible: cada opcion dice de que filtro es
const OPCIONES_PROXIMO_PAGO: OpcionSelector<OpcionProximoPago>[] = [
  { valor: 'VENCIDOS', etiqueta: 'Próximo pago: vencido' },
  { valor: 'SIN_FECHA', etiqueta: 'Próximo pago: sin fecha' },
  { valor: 'FECHA', etiqueta: 'Próximo pago: un día' },
]

/**
 * Filtro por proximo pago: vencidos, sin fecha o un dia concreto. Con "un dia" aparece al lado el boton del
 * calendario; cualquier dia vale, tambien uno pasado.
 */
export function FiltroProximoPago({
  idCampo,
  proximoPago,
  fechaProximoPago,
  onCambiarProximoPago,
  onCambiarFechaProximoPago,
}: FiltroProximoPagoProps) {
  // Solo estado de presentacion: si el calendario esta abierto
  const [calendarioAbierto, setCalendarioAbierto] = useState(false)
  const fechaInicial = parsearFechaCalendario(fechaProximoPago ?? obtenerFechaHoy())

  return (
    <div className="flex flex-col gap-interno sm:flex-row">
      <div className="sm:w-60">
        <FiltroSelector
          idCampo={idCampo}
          variante="barra"
          etiqueta="Próximo pago"
          etiquetaTodos="Próximo pago: todos"
          opciones={OPCIONES_PROXIMO_PAGO}
          valor={proximoPago}
          onCambiarValor={(valor) => {
            onCambiarProximoPago(valor)
            // Elegir "un dia" abre el calendario: sin el dia, el filtro no recorta nada
            if (valor === 'FECHA') setCalendarioAbierto(true)
          }}
        />
      </div>

      {proximoPago === 'FECHA' && (
        <Popover open={calendarioAbierto} onOpenChange={setCalendarioAbierto}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="justify-start bg-fondo-tarjeta sm:w-40">
              <CalendarDays aria-hidden="true" />
              <span className="tabular-nums">
                {fechaProximoPago === null ? 'Elegir día' : formatearFechaCalendarioLegible(fechaProximoPago)}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-2">
            <Calendar
              mode="single"
              defaultMonth={fechaInicial}
              selected={fechaProximoPago ? fechaInicial : undefined}
              classNames={{ selected: 'rounded-mediano bg-primario text-texto-sobre-primario' }}
              onSelect={(fecha) => {
                if (!fecha) return
                onCambiarFechaProximoPago(formatearFechaCalendario(fecha))
                setCalendarioAbierto(false)
              }}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
