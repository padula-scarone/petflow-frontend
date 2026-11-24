import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import type {
  DescuentoManualComprobante,
  DetalleComprobante,
  PagoComprobante,
} from '@/features/ventas/types/comprobante'
import type { CanalVenta, TipoEntrega } from '@/features/ventas/types/venta'

/** TOTAL: no pago nada ahora. PARCIAL: pago una parte y el resto queda como deuda. */
export type TipoDeudaComprobante = 'TOTAL' | 'PARCIAL'

/** Comprobante de una venta con deuda, que queda en PENDIENTE_PAGO. */
export interface ComprobanteConDeuda {
  idVenta: number
  numeroComprobante: string
  /** Fecha y hora de la venta en formato ISO 8601. */
  fechaHora: string
  canalVenta: CanalVenta
  tipoEntrega: TipoEntrega
  nombreVendedor: string
  detalles: DetalleComprobante[]
  /** null cuando la venta no tuvo descuento manual. */
  descuentoManual: DescuentoManualComprobante | null
  tipoDeuda: TipoDeudaComprobante
  /** Subtotal menos descuento manual: lo que vale la venta, sin ajustes de medios. */
  importeVenta: number
  /** Lo cobrado ahora con el ajuste de cada medio; 0 en una deuda total. */
  montoPagadoAhora: number
  /** Lo que queda sin pagar. */
  montoAdeudado: number
  /** Vacio en una deuda total. */
  pagos: PagoComprobante[]
  /** Recibo del pago inicial (REC-...): el back lo registra como un cobro. null en una deuda total. */
  numeroReciboPagoInicial: string | null
  deudor: Deudor
  /** AAAA-MM-DD; null significa "Sin fecha". */
  fechaEstimadaPago: string | null
  /**
   * Aviso cuando el pago inicial no quedo registrado (o no se pudo confirmar): la venta existe como deuda total y el
   * pago se cobra desde Deudores. null cuando todo salio como se pidio.
   */
  avisoPagoInicial: string | null
}

/** Props del comprobante de una venta con deuda. */
export interface RegistrarVentaComprobanteConDeudaProps {
  comprobante: ComprobanteConDeuda
  /** Enlace wa.me con el texto del comprobante. */
  enlaceWhatsApp: string
  /** Enlace mailto: con el asunto y el texto del comprobante. */
  enlaceMail: string
  onNuevaVenta: () => void
}
