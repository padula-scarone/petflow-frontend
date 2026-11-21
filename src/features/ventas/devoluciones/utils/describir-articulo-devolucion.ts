import type { FormatoVenta } from '@/features/ventas/types/historial'

const formateadorCantidad = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 3 })

/** Cantidad con su unidad: "2 u" para unidades y "2,5 kg" para granel. */
export function describirCantidadArticulo(cantidad: number, formatoVenta: FormatoVenta) {
  return `${formateadorCantidad.format(cantidad)} ${formatoVenta === 'GRANEL' ? 'kg' : 'u'}`
}

/** Peso en kilos: "14,8 kg". */
export function describirPesoKg(pesoKg: number) {
  return `${formateadorCantidad.format(pesoKg)} kg`
}

/**
 * Lo devuelto en una linea: "2 u" o, con bolsa abierta (los kilos que entraron al granel), "Bolsa abierta · 14,8 kg".
 * @param pesoDevueltoKg Kilos devueltos; null si no fue bolsa abierta.
 */
export function describirDevolucion(cantidad: number, formatoVenta: FormatoVenta, pesoDevueltoKg: number | null) {
  return pesoDevueltoKg !== null
    ? `Bolsa abierta · ${describirPesoKg(pesoDevueltoKg)}`
    : describirCantidadArticulo(cantidad, formatoVenta)
}
