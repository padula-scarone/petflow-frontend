// El back manda montos, cantidades y porcentajes como texto exacto ("48500.00", "12.000", "-5.00").
// Se convierten sin pasar por coma flotante: se escala el texto a un entero y recien despues se divide.

const PATRON_DECIMAL = /^(-?)(\d+)(?:\.(\d+))?$/

/** Escala un decimal en texto a un entero multiplicado por 10^decimales; null si no tiene la forma esperada. */
function convertirTextoAEnteroEscalado(texto: string, decimales: number): number | null {
  const coincidencia = PATRON_DECIMAL.exec(texto)
  if (coincidencia === null) return null
  const [, signo, parteEntera, parteDecimal = ''] = coincidencia
  // Mas decimales de los que admite la unidad perderian informacion: se rechaza en lugar de redondear
  if (parteDecimal.length > decimales) return null
  const escalado = Number(`${parteEntera}${parteDecimal.padEnd(decimales, '0')}`)
  if (!Number.isSafeInteger(escalado)) return null
  return signo === '-' && escalado !== 0 ? -escalado : escalado
}

/** "48500.00" -> 4850000 centavos; null si el texto no es un monto valido. */
export function convertirTextoACentavos(texto: string) {
  return convertirTextoAEnteroEscalado(texto, 2)
}

/** "2.500" -> 2500 milesimas; null si el texto no es una cantidad valida. */
export function convertirTextoAMilesimas(texto: string) {
  return convertirTextoAEnteroEscalado(texto, 3)
}

/** "10.00" -> 1000 puntos basicos (un punto basico es una centesima de punto porcentual); null si no es valido. */
export function convertirTextoABasisPoints(texto: string) {
  return convertirTextoAEnteroEscalado(texto, 2)
}
