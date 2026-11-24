import type { CanalVenta, FormatoArticulo, TipoEntrega } from '@/features/ventas/types/venta'
import type { DatoEnvio } from '@/features/ventas/utils/listar-datos-envio'

/** Un producto de la venta, tal como se muestra en la confirmacion. */
export interface ProductoResumenVenta {
  idProducto: string
  nombreProducto: string
  formato: FormatoArticulo
  cantidad: number
  /** Precio unitario por cantidad, en pesos. */
  montoTotal: number
}

/** Un medio de pago de la venta, con lo que se cobra ahora y, en efectivo, lo recibido y el vuelto. */
export interface PagoResumenVenta {
  idMedioPago: number
  nombreMedioPago: string
  /** Parte del importe que cubre este medio, antes de su ajuste. */
  montoBase: number
  /** Recargo (positivo) o descuento (negativo) del medio sobre esa parte. */
  montoAjuste: number
  /** Solo efectivo con "Paga con" informado. */
  montoRecibido: number | null
  /** Solo si hay monto recibido. */
  vuelto: number | null
}

/** Descuento manual de la venta, ya convertido a monto. */
export interface DescuentoResumenVenta {
  monto: number
  motivo: string
}

/**
 * Todo lo que se revisa antes de registrar una venta. Lo arma una funcion pura a partir del carrito y del cobro; la
 * vista solo lo muestra. Los datos del envio son personales: nunca van en un log ni en un mensaje.
 */
export interface ResumenConfirmacionVenta {
  productos: ProductoResumenVenta[]
  canalVenta: CanalVenta
  tipoEntrega: TipoEntrega
  /** Direccion y destinatario ya recortados; vacio con Retiro. */
  datosEnvio: DatoEnvio[]
  descuentoManual: DescuentoResumenVenta | null
  /** Vacio cuando todo se fia. */
  pagos: PagoResumenVenta[]
}
