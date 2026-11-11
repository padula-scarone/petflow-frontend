import type { FormatoArticulo } from '@/features/ventas/types/venta'

const formateadorCantidad = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 3 })

/** Devuelve la cantidad con su unidad: "2 u" para unidades y "2,5 kg" para granel. */
export function formatearCantidad(cantidad: number, formato: FormatoArticulo) {
  return `${formateadorCantidad.format(cantidad)} ${formato === 'granel' ? 'kg' : 'u'}`
}
