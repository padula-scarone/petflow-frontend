const formateadorMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

/** Devuelve un monto en pesos argentinos, por ejemplo "$ 12.500". */
export function formatearMoneda(monto: number) {
  return formateadorMoneda.format(monto)
}
