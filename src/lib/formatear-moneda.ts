// Todo importe se muestra siempre con dos decimales ("$ 1.500,00", "$ 1.282,50"), tenga o no centavos.
const formateadorMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

// Espacio sin salto de linea (U+00A0): el signo nunca queda separado del monto
const ESPACIO_SIN_SALTO = String.fromCharCode(0xa0)

/** Devuelve un monto en pesos argentinos con dos decimales, por ejemplo "$ 12.500,00" o "$ 12.500,50". */
export function formatearMoneda(monto: number) {
  return formateadorMoneda.format(monto)
}

/** Devuelve un monto con signo explicito, por ejemplo "− $ 1.500,00" o "+ $ 1.500,00". El cero no lleva signo. */
export function formatearMonedaConSigno(monto: number) {
  if (monto === 0) return formatearMoneda(0)
  const signo = monto < 0 ? '−' : '+'
  return `${signo}${ESPACIO_SIN_SALTO}${formatearMoneda(Math.abs(monto))}`
}
