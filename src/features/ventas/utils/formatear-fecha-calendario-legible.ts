/** Pasa AAAA-MM-DD a DD/MM/AAAA sin pasar por Date, para evitar corrimientos de zona horaria. */
export function formatearFechaCalendarioLegible(fecha: string) {
  const [ejercicio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${ejercicio}`
}
