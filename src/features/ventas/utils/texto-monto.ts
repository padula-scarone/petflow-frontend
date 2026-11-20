// Como se escribe un monto en un campo: coma decimal, sin separador de miles y hasta 2 decimales.
// Si el usuario no escribe decimales se entiende ",00".

/** Cifras maximas de la parte entera: mantiene el monto en centavos dentro de los enteros exactos de JS. */
const CIFRAS_ENTERAS_MAXIMAS = 12
const DECIMALES_MONTO = 2

/** Deja solo lo que se puede tipear: digitos y una coma o punto, con hasta 2 decimales. "," o "." al inicio son "0,". */
export function limpiarTextoMonto(texto: string) {
  const soloPermitidos = texto.replace(/[^\d.,]/g, '')
  const posicionSeparador = soloPermitidos.search(/[.,]/)
  if (posicionSeparador === -1) return soloPermitidos.slice(0, CIFRAS_ENTERAS_MAXIMAS)
  const entera = soloPermitidos.slice(0, posicionSeparador).slice(0, CIFRAS_ENTERAS_MAXIMAS) || '0'
  const decimales = soloPermitidos
    .slice(posicionSeparador + 1)
    .replace(/[.,]/g, '')
    .slice(0, DECIMALES_MONTO)
  return `${entera},${decimales}`
}

/** Convierte lo escrito en pesos; vacio o invalido es null. */
export function parsearTextoMonto(texto: string) {
  if (texto === '') return null
  const numero = Number(texto.replace(',', '.'))
  return Number.isNaN(numero) ? null : numero
}

/** Muestra un monto en el campo con siempre dos decimales: 1500 -> "1500,00"; null es campo vacio. */
export function formatearMontoParaCampo(monto: number | null) {
  return monto === null ? '' : monto.toFixed(DECIMALES_MONTO).replace('.', ',')
}
