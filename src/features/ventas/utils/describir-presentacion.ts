import type { FormatoVenta } from '@/features/ventas/types/historial'
import type { FormatoArticulo } from '@/features/ventas/types/venta'

/** "Unidad" o "Granel". El formato llega en dos formas segun el modulo ("unidad" o "UNIDAD"). */
export function describirPresentacion(formato: FormatoArticulo | FormatoVenta) {
  return formato.toLowerCase() === 'granel' ? 'Granel' : 'Unidad'
}
