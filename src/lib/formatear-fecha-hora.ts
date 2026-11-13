const formateadorFechaHora = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const formateadorHora = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** Devuelve una fecha ISO 8601 como "07/11/2026, 14:32". */
export function formatearFechaHora(fechaIso: string) {
  return formateadorFechaHora.format(new Date(fechaIso))
}

/** Devuelve la hora de una fecha ISO 8601 como "14:32". */
export function formatearHora(fechaIso: string) {
  return formateadorHora.format(new Date(fechaIso))
}

const formateadorFecha = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/** Devuelve la fecha de un instante ISO 8601 como "07/11/2026". */
export function formatearFecha(fechaIso: string) {
  return formateadorFecha.format(new Date(fechaIso))
}
