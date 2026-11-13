import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EtiquetaFiltro, type VarianteFiltro } from '@/features/ventas/components/etiqueta-filtro'
import type { RangoFechasFiltro } from '@/features/ventas/types/compartidos'
import type { PeriodoRapido } from '@/features/ventas/types/historial'
import {
  formatearFechaCalendario,
  parsearFechaCalendario,
} from '@/features/ventas/utils/calcular-periodo-rapido'
import { formatearFechaCalendarioLegible } from '@/features/ventas/utils/formatear-fecha-calendario-legible'

const PERIODOS_RAPIDOS: Array<{ periodo: PeriodoRapido; etiqueta: string }> = [
  { periodo: 'HOY', etiqueta: 'Hoy' },
  { periodo: 'AYER', etiqueta: 'Ayer' },
  { periodo: 'ULTIMOS_7_DIAS', etiqueta: 'Últimos 7 días' },
]

/** Props del filtro por fechas: un selector con atajos y un calendario de rango. */
interface FiltroRangoFechasProps {
  idCampo: string
  variante: VarianteFiltro
  fechaDesde: string | null
  fechaHasta: string | null
  periodoRapidoActivo: PeriodoRapido | null
  /** Acepta cualquier funcion de filtros que contenga las dos fechas (Historial, Cambios, busqueda de venta). */
  onCambiarFiltros: (cambios: Partial<RangoFechasFiltro>) => void
  onSeleccionarPeriodoRapido: (periodo: PeriodoRapido) => void
}

/** Texto del boton: el atajo elegido, el rango o "Todas las fechas". */
function describirSeleccion(
  fechaDesde: string | null,
  fechaHasta: string | null,
  periodoRapidoActivo: PeriodoRapido | null,
) {
  if (fechaDesde === null && fechaHasta === null) return 'Todas las fechas'
  if (periodoRapidoActivo) {
    return PERIODOS_RAPIDOS.find(({ periodo }) => periodo === periodoRapidoActivo)?.etiqueta ?? ''
  }
  const desde = fechaDesde ? formatearFechaCalendarioLegible(fechaDesde) : null
  const hasta = fechaHasta ? formatearFechaCalendarioLegible(fechaHasta) : null
  if (desde && hasta) return desde === hasta ? desde : `${desde} – ${hasta}`
  return desde ? `Desde ${desde}` : `Hasta ${hasta}`
}

export function FiltroRangoFechas({
  idCampo,
  variante,
  fechaDesde,
  fechaHasta,
  periodoRapidoActivo,
  onCambiarFiltros,
  onSeleccionarPeriodoRapido,
}: FiltroRangoFechasProps) {
  const descripcion = describirSeleccion(fechaDesde, fechaHasta, periodoRapidoActivo)
  const hayFechas = fechaDesde !== null || fechaHasta !== null

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <EtiquetaFiltro variante={variante} idCampo={idCampo}>
        Fecha
      </EtiquetaFiltro>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={idCampo}
            type="button"
            variant="outline"
            aria-label={variante === 'barra' ? `Fecha: ${descripcion}` : undefined}
            className="h-11 w-full justify-start gap-2 bg-fondo-tarjeta px-3 font-normal"
          >
            <CalendarDays aria-hidden="true" className="text-texto-suave" />
            <span className="truncate tabular-nums">{descripcion}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-2">
          <div className="flex flex-col gap-2 sm:flex-row">
            {/* --- ATAJOS --- */}
            <div role="group" aria-label="Atajos de fecha" className="flex flex-wrap gap-1 sm:w-40 sm:flex-col sm:flex-nowrap">
              {PERIODOS_RAPIDOS.map(({ periodo, etiqueta }) => (
                <PopoverClose key={periodo} asChild>
                  <Button
                    type="button"
                    variant={periodoRapidoActivo === periodo ? 'secondary' : 'ghost'}
                    aria-pressed={periodoRapidoActivo === periodo}
                    className="h-11 justify-start px-3"
                    onClick={() => onSeleccionarPeriodoRapido(periodo)}
                  >
                    {etiqueta}
                  </Button>
                </PopoverClose>
              ))}
              <PopoverClose asChild>
                <Button
                  type="button"
                  variant={hayFechas ? 'ghost' : 'secondary'}
                  aria-pressed={!hayFechas}
                  className="h-11 justify-start px-3"
                  onClick={() => onCambiarFiltros({ fechaDesde: null, fechaHasta: null })}
                >
                  Todas las fechas
                </Button>
              </PopoverClose>
            </div>

            {/* --- CALENDARIO DE RANGO --- */}
            <Calendar
              mode="range"
              resetOnSelect
              defaultMonth={fechaDesde ? parsearFechaCalendario(fechaDesde) : undefined}
              selected={
                hayFechas
                  ? {
                      from: fechaDesde ? parsearFechaCalendario(fechaDesde) : undefined,
                      to: fechaHasta ? parsearFechaCalendario(fechaHasta) : undefined,
                    }
                  : undefined
              }
              onSelect={(rango) =>
                onCambiarFiltros({
                  fechaDesde: rango?.from ? formatearFechaCalendario(rango.from) : null,
                  fechaHasta: rango?.to ? formatearFechaCalendario(rango.to) : null,
                })
              }
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
