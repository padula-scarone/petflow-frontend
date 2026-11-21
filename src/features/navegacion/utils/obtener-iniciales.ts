/** Primera letra de una palabra, sin partir caracteres compuestos (letras con tilde, emojis). */
const obtenerPrimeraLetra = (palabra: string) => Array.from(palabra)[0] ?? ''

/**
 * Iniciales de un nombre: la primera letra del primer y del ultimo nombre ("Vendedor Demo" -> "VD"). Con un solo
 * nombre, una sola letra; sin nombre, un signo de pregunta.
 */
export function obtenerIniciales(nombre: string) {
  const [primeraPalabra, ...restoPalabras] = nombre.trim().split(/\s+/).filter(Boolean)
  if (primeraPalabra === undefined) return '?'
  const ultimaPalabra = restoPalabras.at(-1) ?? ''
  return (obtenerPrimeraLetra(primeraPalabra) + obtenerPrimeraLetra(ultimaPalabra)).toLocaleUpperCase('es')
}
