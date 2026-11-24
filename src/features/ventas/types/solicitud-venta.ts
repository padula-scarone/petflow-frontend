import type { CanalVenta, TipoEntrega } from '@/features/ventas/types/venta'

// La solicitud ya usa los tipos del front (ids string, enums en minusculas) pero con los montos en
// centavos enteros. La capa api la convierte al body que espera el back.

/** Un pago de la solicitud. */
export interface PagoSolicitud {
  idMedioPago: number
  /** Porcion del total que cubre este medio, antes de su ajuste. */
  montoBaseCentavos: number
  /** Solo efectivo con "Paga con" cargado; null en el resto. */
  montoRecibidoCentavos: number | null
}

/** Descuento manual de la solicitud; con descuento el motivo es obligatorio. */
export interface DescuentoSolicitud {
  montoCentavos: number
  /** Ya recortado y de 1 a 200 caracteres. */
  motivo: string
}

/** Lo que aporta la pantalla de cobro a la solicitud. */
export interface DatosCobroSolicitud {
  /** Vacio en un fiado. */
  pagos: PagoSolicitud[]
  /** null cuando no hay descuento: no se envia ni el monto ni el motivo. */
  descuentoManual: DescuentoSolicitud | null
  /** Solo en un fiado: nombre del deudor, ya recortado y de 1 a 100 caracteres. */
  clienteReferencia: string | null
}

/** Venta lista para registrar en el back. */
export interface SolicitudVenta extends DatosCobroSolicitud {
  canalVenta: CanalVenta
  tipoEntrega: TipoEntrega
  items: { idProducto: string; cantidad: number }[]
  /** Solo en un fiado (sin pagos): a quien se le fia. Una venta de contado con deudor es 400. */
  idDeudor?: number
  /** AAAA-MM-DD, solo en un fiado. Se omite para "Sin fecha". No puede ser anterior a hoy (hora de Argentina). */
  fechaEstimadaPago?: string
  /**
   * Direccion de envio, una sola linea de 1 a 200 caracteres. El back la exige con Envio y la rechaza con Retiro.
   * Todavia no hay interfaz que la pida: la solicitud ya sabe llevarla para cuando se agregue. Es un dato personal:
   * nunca va en un mensaje ni en un log.
   */
  direccionEnvio?: string
}
