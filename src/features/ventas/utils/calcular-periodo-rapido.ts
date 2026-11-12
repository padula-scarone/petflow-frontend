import type { PeriodoRapido } from '@/features/ventas/types/historial'

const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000

/** Devuelve una fecha como AAAA-MM-DD en hora local, el formato del input de fecha y del back. */
export function formatearFechaCalendario(fecha: Date) {
  const ejercicio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${ejercicio}-${mes}-${dia}`
}

/** Convierte AAAA-MM-DD en una fecha local a medianoche, la que espera el calendario. */
export function parsearFechaCalendario(fecha: string) {
  const [ejercicio, mes, dia] = fecha.split('-').map(Number)
  return new Date(ejercicio, mes - 1, dia)
}

/** Rango de fechas (inclusivo) de un atajo, calculado a partir del momento actual. */
export function calcularPeriodoRapido(periodo: PeriodoRapido, ahora: Date) {
  const hoy = formatearFechaCalendario(ahora)
  const ayer = formatearFechaCalendario(new Date(ahora.getTime() - MILISEGUNDOS_POR_DIA))
  const haceSeisDias = formatearFechaCalendario(new Date(ahora.getTime() - 6 * MILISEGUNDOS_POR_DIA))

  if (periodo === 'HOY') return { fechaDesde: hoy, fechaHasta: hoy }
  if (periodo === 'AYER') return { fechaDesde: ayer, fechaHasta: ayer }
  return { fechaDesde: haceSeisDias, fechaHasta: hoy }
}
