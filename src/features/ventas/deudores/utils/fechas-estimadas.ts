// Las fechas estimadas viajan como texto AAAA-MM-DD, sin hora. Se comparan como texto (el orden alfabetico es el
// cronologico) y solo se pasan a Date para el calendario, siempre en hora local para evitar corrimientos de zona.

const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000

function completarConCeros(numero: number) {
  return String(numero).padStart(2, '0')
}

/** Pasa un Date a AAAA-MM-DD usando la fecha local. */
export function convertirDateAFechaTexto(fecha: Date) {
  return `${fecha.getFullYear()}-${completarConCeros(fecha.getMonth() + 1)}-${completarConCeros(fecha.getDate())}`
}

/** Pasa AAAA-MM-DD a un Date a medianoche local. */
export function convertirFechaTextoADate(fecha: string) {
  const [ejercicio, mes, dia] = fecha.split('-').map(Number)
  return new Date(ejercicio, mes - 1, dia)
}

/** Fecha de hoy como AAAA-MM-DD. */
export function obtenerFechaHoy() {
  return convertirDateAFechaTexto(new Date())
}

/** Suma (o resta) dias a una fecha AAAA-MM-DD. */
export function sumarDiasAFecha(fecha: string, dias: number) {
  const base = convertirFechaTextoADate(fecha)
  // Se suma sobre el mediodia: un cambio de horario no mueve el resultado de dia
  return convertirDateAFechaTexto(new Date(base.getTime() + dias * MILISEGUNDOS_POR_DIA + MILISEGUNDOS_POR_DIA / 2))
}

/** Verdadero si la fecha es anterior a hoy. Hoy no cuenta como pasada: es el ultimo dia para pagar. */
export function esFechaPasada(fecha: string, hoy: string = obtenerFechaHoy()) {
  return fecha < hoy
}

/** Pasa AAAA-MM-DD a DD/MM/AAAA sin pasar por Date. */
export function formatearFechaEstimada(fecha: string) {
  const [ejercicio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${ejercicio}`
}

/** Describe la fecha estimada para mostrar: la fecha o "Sin fecha". */
export function describirFechaEstimada(fecha: string | null) {
  return fecha === null ? 'Sin fecha' : formatearFechaEstimada(fecha)
}

/** Fecha AAAA-MM-DD de un instante ISO 8601, en hora local. */
export function extraerFechaDeInstante(fechaIso: string) {
  return convertirDateAFechaTexto(new Date(fechaIso))
}
