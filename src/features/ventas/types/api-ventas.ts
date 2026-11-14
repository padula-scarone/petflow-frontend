// Contrato crudo del back para Registrar Venta. Solo lo usa la capa api: el resto del front trabaja
// con los tipos de dominio (ids string, enums en minusculas, montos y cantidades numericos).

/** Origen de la venta, tal como lo manda el back. */
export type OrigenApi = 'MOSTRADOR' | 'DIGITAL'

/** Modalidad de entrega, tal como la manda el back. */
export type ModalidadEntregaApi = 'RETIRO' | 'ENVIO'

/** Formato de venta del producto, tal como lo manda el back. */
export type FormatoVentaApi = 'UNIDAD' | 'GRANEL'

/** Tipo de medio de pago. Solo EFECTIVO admite monto recibido y vuelto. */
export type TipoMedioPagoApi = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'BILLETERA_VIRTUAL'

/** Estados con los que nace una venta. */
export type EstadoVentaApi = 'COMPLETADA' | 'PENDIENTE_PAGO'

// --- GET /api/productos ---

/** Producto activo del catalogo. Montos y stock llegan como texto exacto. */
export interface ProductoApi {
  idProducto: number
  nombre: string
  /** Nombre vigente de la categoria; el back siempre la manda. */
  categoria: string
  /** Texto con 2 decimales, por ejemplo "48500.00". */
  precioVenta: string
  /** Texto con 3 decimales, por ejemplo "12.000". */
  stockFisico: string
  formatoVenta: FormatoVentaApi
}

/** Respuesta 200 de GET /api/productos. */
export interface ConsultarProductosResponse {
  productos: ProductoApi[]
}

// --- GET /api/medios-pago ---

/** Medio de pago activo. Los porcentajes llegan como texto con 2 decimales. */
export interface MedioPagoApi {
  idMedioPago: number
  nombre: string
  tipo: TipoMedioPagoApi
  porcentajeRecargo: string
  porcentajeDescuento: string
}

/** Respuesta 200 de GET /api/medios-pago. */
export interface ListarMediosPagoResponse {
  mediosPago: MedioPagoApi[]
}

// --- POST /api/ventas ---

/** Un pago del body. `monto` es la porcion base: sin el ajuste del medio. */
export interface PagoRequest {
  idMedioPago: number
  /** En pesos, hasta 2 decimales. */
  monto: number
  /** Solo en efectivo y solo si se cargo "Paga con". En pesos, hasta 2 decimales. */
  montoRecibido?: number
}

/** Body de POST /api/ventas. El vendedor sale del token: no se envia. */
export interface RegistrarVentaRequest {
  origen: OrigenApi
  modalidadEntrega: ModalidadEntregaApi
  /** Sin productos repetidos. */
  items: { idProducto: number; cantidad: number }[]
  /** Vacio en un fiado. */
  pagos: PagoRequest[]
  /** En pesos, hasta 2 decimales. Se omite junto con motivoDescuento cuando no hay descuento. */
  descuentoManual?: number
  motivoDescuento?: string
  /** Obligatorio en un fiado. */
  clienteReferencia?: string
}

/** Pago de la respuesta del alta. */
export interface PagoRegistradoApi {
  idMedioPago: number
  montoFinal: string
  montoRecibido: string | null
  vuelto: string | null
}

/** Respuesta 201 de POST /api/ventas. */
export interface RegistrarVentaResponse {
  venta: {
    idVenta: number
    numeroComprobante: string
    montoTotal: string
    estado: EstadoVentaApi
    fechaHora: string
    pagos: PagoRegistradoApi[]
  }
}

// --- GET /api/ventas/:idVenta ---

/** Renglon de producto del detalle. */
export interface ItemDetalleApi {
  idProducto: number
  nombreProducto: string
  formatoVenta: FormatoVentaApi
  /** Texto con 3 decimales. */
  cantidad: string
  precioUnitario: string
  subtotal: string
}

/** Pago del detalle, con el porcentaje que se aplico al registrarlo. */
export interface PagoDetalleApi {
  idMedioPago: number
  nombreMedioPago: string
  montoBase: string
  /** Ajuste neto con signo, por ejemplo "-5.00" si el medio dio descuento. */
  porcentajeAplicado: string
  montoFinal: string
  /** null si no se informo "Paga con". */
  montoRecibido: string | null
  /** null siempre que montoRecibido sea null. */
  vuelto: string | null
}

/** Venta del detalle. */
export interface VentaDetalleApi {
  idVenta: number
  numeroComprobante: string | null
  fechaHora: string
  /** El detalle sirve para cualquier estado; este flujo solo admite los dos con los que nace una venta. */
  estado: EstadoVentaApi | 'ANULADA'
  /** Hasta cuando se puede editar o anular; null si esta anulada. */
  fechaHoraLimiteModificacion: string | null
  origen: OrigenApi
  modalidadEntrega: ModalidadEntregaApi
  clienteReferencia: string | null
  vendedor: { idUsuario: number; nombre: string }
  subtotalBruto: string
  descuentoManual: string
  motivoDescuento: string | null
  montoTotal: string
  items: ItemDetalleApi[]
  /** Vacio en un fiado. */
  pagos: PagoDetalleApi[]
}

/** Respuesta 200 de GET /api/ventas/:idVenta. */
export interface ConsultarVentaResponse {
  /** Hora del servidor al responder (ISO 8601): sirve para corregir el reloj del dispositivo. */
  fechaHoraServidor: string
  venta: VentaDetalleApi
}
