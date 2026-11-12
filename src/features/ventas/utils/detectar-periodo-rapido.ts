import { calcularPeriodoRapido } from '@/features/ventas/utils/calcular-periodo-rapido'
import type { PeriodoRapido } from '@/features/ventas/types/historial'

const PERIODOS: PeriodoRapido[] = ['HOY', 'AYER', 'ULTIMOS_7_DIAS']

/** Devuelve el atajo que coincide exactamente con el rango elegido, o null si es un rango propio. */
export function detectarPeriodoRapido(
  fechaDesde: string | null,
  fechaHasta: string | null,
  ahora: Date,
): PeriodoRapido | null {
  if (fechaDesde === null || fechaHasta === null) return null
  return (
    PERIODOS.find((periodo) => {
      const rango = calcularPeriodoRapido(periodo, ahora)
      return rango.fechaDesde === fechaDesde && rango.fechaHasta === fechaHasta
    }) ?? null
  )
}
