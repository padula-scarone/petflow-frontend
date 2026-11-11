import type { CanalVenta, FormatoArticulo, TipoEntrega } from '@/features/ventas/types/venta'

/** Renglon de producto del comprobante. */
export interface DetalleComprobante {
  idProducto: string
  nombreProducto: string
  formato: FormatoArticulo
  /** Admite decimales cuando el formato es granel (kg). */
  cantidad: number
  /** Precio vigente al momento de la venta. */
  precioUnitario: number
  subtotal: number
}

/** Descuento manual de la venta. Se registra como monto en pesos: el porcentaje es solo una forma de escribirlo. */
export interface DescuentoManualComprobante {
  motivo: string
  /** Monto descontado, siempre positivo. */
  monto: number
}

/** Datos comunes a todo pago registrado. */
interface PagoComprobanteBase {
  idMedioPago: string
  nombreMedioPago: string
  /** Parte del total cubierta por este medio, antes de su ajuste. */
  montoBase: number
  /** Ajuste porcentual del medio: negativo = descuento, positivo = recargo, 0 = sin cambios. */
  porcentajeAjuste: number
  /** Monto del ajuste en pesos: negativo = descuento, positivo = recargo (montoFinal - montoBase). */
  montoAjuste: number
  /** Lo que efectivamente se cobro con este medio. */
  montoFinal: number
}

/** Pago con un medio que admite vuelto (efectivo): el monto recibido y el vuelto son obligatorios. */
export interface PagoConVueltoComprobante extends PagoComprobanteBase {
  admiteVuelto: true
  montoRecibido: number
  vuelto: number
}

/** Pago con un medio que no admite vuelto (tarjeta, transferencia, QR). */
export interface PagoSinVueltoComprobante extends PagoComprobanteBase {
  admiteVuelto: false
}

/** Pago registrado con un medio. */
export type PagoComprobante = PagoConVueltoComprobante | PagoSinVueltoComprobante

/** Datos comunes a toda venta registrada, cobrada o fiada. */
interface ComprobanteBase {
  idVenta: string
  numeroComprobante: string
  /** Fecha y hora de la venta en formato ISO 8601. */
  fechaHora: string
  canalVenta: CanalVenta
  tipoEntrega: TipoEntrega
  nombreVendedor: string
  detalles: DetalleComprobante[]
  /** null cuando la venta no tuvo descuento manual. */
  descuentoManual: DescuentoManualComprobante | null
  subtotalProductos: number
  montoTotal: number
}

/** Venta cobrada: tiene al menos un pago y el cliente es opcional. */
export interface ComprobanteCobrado extends ComprobanteBase {
  estado: 'completada'
  /** null cuando la venta no se asocio a un cliente. */
  clienteReferencia: string | null
  pagos: [PagoComprobante, ...PagoComprobante[]]
}

/** Venta fiada: no tiene pagos y el cliente deudor es obligatorio. */
export interface ComprobanteFiado extends ComprobanteBase {
  estado: 'pendiente-pago'
  clienteReferencia: string
}

/** Comprobante de una venta registrada. */
export type Comprobante = ComprobanteCobrado | ComprobanteFiado

/** Props del componente presentacional de la Seccion 3 de Registrar Venta. */
export interface RegistrarVentaComprobanteProps {
  comprobante: Comprobante
  /** Enlace wa.me con el texto del comprobante, armado por el hook. */
  enlaceWhatsApp: string
  /** Enlace mailto: con el asunto y el texto del comprobante, armado por el hook. */
  enlaceMail: string
  /** Falso cuando ya vencio la ventana de 15 minutos para editar. */
  edicionDisponible: boolean
  /** Hasta cuando se puede editar, en formato ISO 8601. */
  fechaHoraLimiteEdicion: string
  onEditarVenta: () => void
  onNuevaVenta: () => void
}
