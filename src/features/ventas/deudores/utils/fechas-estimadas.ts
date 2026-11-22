import {
  formatearFechaCalendario,
  parsearFechaCalendario,
} from '@/features/ventas/utils/calcular-periodo-rapido'
import { formatearFechaCalendarioLegible } from '@/features/ventas/utils/formatear-fecha-calendario-legible'

// Las fechas estimadas viajan como texto AAAA-MM-DD, sin hora. Se comparan como texto (el orden alfabetico es el
// cronologico) y solo se pasan a Date para el calendario, siempre en hora local para evitar corrimientos de zona.

const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000

/** Fecha de hoy como AAAA-MM-DD. */
export function obtenerFechaHoy() {
  return formatearFechaCalendario(new Date())
}

/** Suma (o resta) dias a una fecha AAAA-MM-DD. */
export function sumarDiasAFecha(fecha: string, dias: number) {
  const base = parsearFechaCalendario(fecha)
  // Se suma sobre el mediodia: un cambio de horario no mueve el resultado de dia
  return formatearFechaCalendario(new Date(base.getTime() + dias * MILISEGUNDOS_POR_DIA + MILISEGUNDOS_POR_DIA / 2))
}

/** Verdadero si la fecha es anterior a hoy. Hoy no cuenta como pasada: es el ultimo dia para pagar. */
export function esFechaPasada(fecha: string, hoy: string = obtenerFechaHoy()) {
  return fecha < hoy
}

/** Describe la fecha estimada para mostrar: DD/MM/AAAA o "Sin fecha". */
export function describirFechaEstimada(fecha: string | null) {
  return fecha === null ? 'Sin fecha' : formatearFechaCalendarioLegible(fecha)
}
