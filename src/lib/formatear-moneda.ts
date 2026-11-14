const OPCIONES_MONEDA = { style: 'currency', currency: 'ARS' } as const

const formateadorEnteros = new Intl.NumberFormat('es-AR', {
  ...OPCIONES_MONEDA,
  maximumFractionDigits: 0,
})

// Los centavos se muestran solo si el monto los tiene: el back calcula al centavo y un total de $ 1.151,15
// no puede verse como $ 1.151. Cuando se muestran van siempre con dos cifras ("$ 1.282,50", no "$ 1.282,5").
const formateadorConCentavos = new Intl.NumberFormat('es-AR', {
  ...OPCIONES_MONEDA,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const CENTAVOS_POR_PESO = 100
// Espacio sin salto de linea (U+00A0): el signo nunca queda separado del monto
const ESPACIO_SIN_SALTO = String.fromCharCode(0xa0)

/** Devuelve un monto en pesos argentinos, por ejemplo "$ 12.500" o "$ 12.500,50". */
export function formatearMoneda(monto: number) {
  const tieneCentavos = Math.round(monto * CENTAVOS_POR_PESO) % CENTAVOS_POR_PESO !== 0
  return (tieneCentavos ? formateadorConCentavos : formateadorEnteros).format(monto)
}

/** Devuelve un monto con signo explicito, por ejemplo "− $ 1.500" o "+ $ 1.500". El cero no lleva signo. */
export function formatearMonedaConSigno(monto: number) {
  if (monto === 0) return formatearMoneda(0)
  const signo = monto < 0 ? '−' : '+'
  return `${signo}${ESPACIO_SIN_SALTO}${formatearMoneda(Math.abs(monto))}`
}
