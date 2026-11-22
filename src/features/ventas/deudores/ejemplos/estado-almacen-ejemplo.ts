import { crearEstadoInicialDeudores } from '@/features/ventas/deudores/ejemplos/datos-deudores-ejemplo'
import type { EstadoAlmacenDeudores } from '@/features/ventas/deudores/ejemplos/tipos-almacen-ejemplo'

// Todo el estado del almacen es un solo objeto inmutable: cada cambio lo reemplaza por uno nuevo y avisa a quienes
// lo escuchan. Vive en el modulo, asi sobrevive a la navegacion entre pantallas mientras no se recargue la pagina.

let estadoActual: EstadoAlmacenDeudores | null = null
let versionActual = 0
const oyentes = new Set<() => void>()

/** Lee el estado; la primera vez lo crea con los datos de ejemplo. */
export function leerEstadoAlmacen() {
  if (estadoActual === null) estadoActual = crearEstadoInicialDeudores()
  return estadoActual
}

/** Reemplaza el estado por el que devuelve `actualizar` y avisa a los oyentes. */
export function escribirEstadoAlmacen(actualizar: (estado: EstadoAlmacenDeudores) => EstadoAlmacenDeudores) {
  estadoActual = actualizar(leerEstadoAlmacen())
  versionActual += 1
  oyentes.forEach((oyente) => oyente())
}

/** Compatible con useSyncExternalStore: quien se suscribe se entera de cada cambio. */
export function suscribirAlmacenDeudores(oyente: () => void) {
  oyentes.add(oyente)
  return () => {
    oyentes.delete(oyente)
  }
}

/** Numero que sube con cada cambio; useSyncExternalStore lo usa como foto del almacen. */
export function obtenerVersionAlmacenDeudores() {
  return versionActual
}
