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

/** Cualquier estado de una venta en el historial: los dos con los que nace mas ANULADA. */
export type EstadoVentaConAnuladaApi = EstadoVentaApi | 'ANULADA'

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
  // Datos de "bolsa abierta" (para Cambios). Opcionales para no romper si el back no los manda: sin ellos
  // el producto simplemente no admite bolsa abierta.
  /** true si el producto se puede devolver como bolsa abierta (la regla la decide el back). */
  permiteBolsaAbierta?: boolean
  /** Producto a granel vinculado; se informa aunque ese granel este inactivo. */
  idProductoGranel?: number | null
  nombreProductoGranel?: string | null
  /** Kilos por unidad, texto con 3 decimales ("15.000"). */
  pesoUnitario?: string | null
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
  /** Lo devuelto en cambios activos de la venta, texto con 3 decimales ("0.000" si nada). Es para Cambios. */
  cantidadYaDevuelta: string
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

/** Auditoria de una venta anulada. El usuario y la fecha y hora los asigna el servidor. */
export interface AnulacionApi {
  /** ISO 8601. */
  fechaHora: string
  /** Texto libre de 1 a 200 caracteres: el back no guarda codigos de motivo. */
  motivo: string
  usuario: { idUsuario: number; nombre: string }
}

/** Venta del detalle. */
export interface VentaDetalleApi {
  idVenta: number
  numeroComprobante: string | null
  fechaHora: string
  /** null mientras el fiado no se cobro. */
  fechaHoraPago: string | null
  /** El detalle sirve para cualquier estado. */
  estado: EstadoVentaConAnuladaApi
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
  /** null si la venta no esta anulada (o se anulo antes de que se registrara la auditoria). */
  anulacion: AnulacionApi | null
}

/** Respuesta 200 de GET /api/ventas/:idVenta. */
export interface ConsultarVentaResponse {
  /** Hora del servidor al responder (ISO 8601): sirve para corregir el reloj del dispositivo. */
  fechaHoraServidor: string
  venta: VentaDetalleApi
}

// --- GET /api/ventas ---

/** Query del historial. Todo es opcional y se combina con AND; la capa api omite lo vacio. */
export interface ConsultaHistorialApi {
  pagina: number
  cantidadPorPagina: number
  /** AAAA-MM-DD, inclusiva, hora de Argentina. No puede ser posterior a fechaHasta. */
  fechaDesde?: string
  fechaHasta?: string
  idProducto?: number
  estado?: EstadoVentaConAnuladaApi
  origen?: OrigenApi
  /** Id de un medio (ventas con un unico pago de ese medio) o "MIXTO" (mas de un pago). */
  medioPago?: number | 'MIXTO'
  /** Hasta 100 caracteres. */
  textoCliente?: string
  /** Hasta 30 caracteres. */
  numeroComprobante?: string
}

/** Fila de la grilla del historial. */
export interface VentaHistorialApi {
  idVenta: number
  /** null solo en datos anteriores a que toda venta emitiera comprobante. */
  numeroComprobante: string | null
  fechaHora: string
  estado: EstadoVentaConAnuladaApi
  /** null si esta anulada. */
  fechaHoraLimiteModificacion: string | null
  /** Texto con 2 decimales. */
  montoTotal: string
  clienteReferencia: string | null
  origen: OrigenApi
  modalidadEntrega: ModalidadEntregaApi
  /** Cambios de mercaderia activos vinculados a la venta. Es para Cambios. */
  cantidadCambiosActivos: number
}

/** Metadatos de paginacion del historial. */
export interface PaginacionHistorialApi {
  pagina: number
  cantidadPorPagina: number
  totalRegistros: number
  totalPaginas: number
}

/** Respuesta 200 de GET /api/ventas. Una pagina fuera de rango devuelve `ventas` vacio, no 404. */
export interface ConsultarHistorialResponse {
  fechaHoraServidor: string
  ventas: VentaHistorialApi[]
  paginacion: PaginacionHistorialApi
}

// --- POST /api/ventas/:idVenta/anulacion ---

/** Body de la anulacion (tambien la usa Editar). El usuario sale del token. */
export interface AnularVentaRequest {
  /** De 1 a 200 caracteres, recortado. */
  motivo: string
}

/** Respuesta 200 de la anulacion. */
export interface AnularVentaResponse {
  venta: {
    idVenta: number
    numeroComprobante: string | null
    estado: 'ANULADA'
    /** COMPLETADA: se repuso el stock y se revirtio la caja. PENDIENTE_PAGO: solo stock. */
    estadoAnterior: EstadoVentaApi
    anulacion: { fechaHora: string; motivo: string }
  }
}

// --- POST /api/ventas/:idVenta/cobro ---

/** Body del cobro de un fiado: al menos un pago y sin medios repetidos. */
export interface CobrarFiadoRequest {
  pagos: PagoRequest[]
}

/** Respuesta 200 del cobro. No trae items: el recibo se arma con GET /api/ventas/:idVenta. */
export interface CobrarFiadoResponse {
  venta: {
    idVenta: number
    numeroComprobante: string | null
    estado: 'COMPLETADA'
    /** Con los ajustes del dia: puede diferir del importe adeudado. */
    montoTotal: string
    fechaHoraPago: string
    pagos: PagoRegistradoApi[]
  }
}
