import type { PropiedadesCobro } from '@/features/ventas/types/cobro'
import type { Comprobante } from '@/features/ventas/types/comprobante'
import type { RegistrarVentaCarritoProps } from '@/features/ventas/types/venta'

/** Props del carrito sin la navegacion a Cobro. */
export type PropiedadesCarrito = Omit<RegistrarVentaCarritoProps, 'onContinuarACobro'>

/** Estado de la venta en curso, compartido entre las tres rutas de Registrar Venta. */
export interface ContextoRegistrarVenta {
  propiedadesCarrito: PropiedadesCarrito
  propiedadesCobro: PropiedadesCobro
  /** null hasta que se confirma el cobro. */
  comprobante: Comprobante | null
  /** Arma el comprobante de ejemplo con el carrito y el cobro actuales y lo guarda. */
  confirmarCobro: () => void
  /** Descarta toda la venta (carrito, cobro y comprobante) y empieza una vacia. */
  iniciarNuevaVenta: () => void
}
