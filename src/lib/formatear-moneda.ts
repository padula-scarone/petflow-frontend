const formateadorMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

/** Devuelve un monto en pesos argentinos, por ejemplo "$ 12.500". */
export function formatearMoneda(monto: number) {
  return formateadorMoneda.format(monto)
}

/** Devuelve un monto con signo explicito, por ejemplo "− $ 1.500" o "+ $ 1.500". El cero no lleva signo. */
export function formatearMonedaConSigno(monto: number) {
  if (monto === 0) return formatearMoneda(0)
  const signo = monto < 0 ? '−' : '+'
  // Espacio sin salto de linea: el signo nunca queda separado del monto
  return `${signo}\u00A0${formatearMoneda(Math.abs(monto))}`
}
