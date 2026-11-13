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

/** Lo devuelto en una linea: "2 u" o, con bolsa abierta, "Bolsa abierta · 14,8 kg". */
export function describirDevolucion(cantidad: number, formatoVenta: FormatoVenta, esBolsaAbierta: boolean) {
  return esBolsaAbierta
    ? `Bolsa abierta · ${describirPesoKg(cantidad)}`
    : describirCantidadArticulo(cantidad, formatoVenta)
}
