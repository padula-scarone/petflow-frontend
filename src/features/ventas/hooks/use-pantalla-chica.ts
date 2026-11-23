import { useSyncExternalStore } from 'react'

// Un celular en vertical (menos de 640 px de ancho) o en horizontal (menos de 480 px de alto): lugares donde un
// desplegable no tiene espacio para mostrarse entero.
const CONSULTA_PANTALLA_CHICA = '(max-width: 639px), (max-height: 479px)'

function suscribirse(alCambiar: () => void) {
  const consulta = window.matchMedia(CONSULTA_PANTALLA_CHICA)
  consulta.addEventListener('change', alCambiar)
  return () => consulta.removeEventListener('change', alCambiar)
}

function leerPantallaChica() {
  return window.matchMedia(CONSULTA_PANTALLA_CHICA).matches
}

/** Verdadero en un celular, en vertical o en horizontal. Se actualiza solo si la pantalla gira o cambia de tamano. */
export function usePantallaChica() {
  return useSyncExternalStore(suscribirse, leerPantallaChica, () => false)
}
