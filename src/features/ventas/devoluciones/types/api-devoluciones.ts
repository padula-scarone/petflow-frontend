import type { FormatoVentaApi, ModalidadEntregaApi, PaginacionHistorialApi } from '@/features/ventas/types/api-ventas'

// Contrato crudo del back para Devoluciones (modulo devoluciones). Solo lo usa la capa api: el
// resto del front trabaja con los tipos de dominio de types/devolución.ts (montos en pesos, cantidades numericas).
// Montos y cantidades llegan como texto exacto: importes con 2 decimales y cantidades con 3.

/** Estado de una devolución. ANULADO es baja logica. */
export type EstadoDevolucionApi = 'ACTIVO' | 'ANULADO'

/** Filtro por vinculo con una venta original. */
export type VinculoDevolucionApi = 'VINCULADO' | 'DESVINCULADO'

/** Valor de `codigo` en los errores de Devoluciones. Los 401 y 403 de autenticacion no lo traen. */
export type CodigoErrorDevolucion =
  | 'DATOS_INVALIDOS'
  | 'SALDO_NEGATIVO'
  | 'VENTA_NO_ENCONTRADA'
  | 'CAMBIO_NO_ENCONTRADO'
  | 'SIN_CAJA_ABIERTA'
  | 'STOCK_INSUFICIENTE'
  | 'VENTA_NO_VINCULABLE'
  | 'CANTIDAD_EXCEDE_VENTA'
  | 'PLAZO_VENCIDO'
  | 'CAMBIO_YA_ANULADO'
  | 'STOCK_INSUFICIENTE_PARA_REVERTIR'

// --- GET /api/cambios-mercaderia ---

/** Query de la lista. Todo es opcional y se combina con AND; la capa api omite lo vacio. */
export interface ConsultaDevolucionesApi {
  pagina: number
  /** Por defecto 20, maximo 100. */
  cantidadPorPagina: number
  /** AAAA-MM-DD, inclusiva, hora de Argentina. No puede ser posterior a fechaHasta. */
  fechaDesde?: string
  fechaHasta?: string
  /** Coincide con el producto devuelto o con el entregado. */
  idProducto?: number
  estado?: EstadoDevolucionApi
  vinculo?: VinculoDevolucionApi
  /** Una devolución con saldo 0 no tiene medio y no coincide. */
  idMedioPago?: number
}

/** Fila de la lista. */
export interface DevolucionListadoApi {
  idCambio: number
  /** ISO 8601. */
  fechaHora: string
  estado: EstadoDevolucionApi
  /** null si esta ANULADA. */
  fechaHoraLimiteModificacion: string | null
  idVentaOriginal: number | null
  /** null sin venta, o en ventas anteriores a que toda venta emitiera comprobante. */
  numeroComprobanteVentaOriginal: string | null
  idProductoDevuelto: number
  nombreProductoDevuelto: string
  formatoVentaProductoDevuelto: FormatoVentaApi
  /** Con bolsa abierta son bolsas enteras. */
  cantidadDevuelta: string
  esBolsaAbierta: boolean
  /** Kilos que entraron al granel; solo con bolsa abierta, null en otro caso. */
  cantidadStockIngresado: string | null
  idProductoEntregado: number
  nombreProductoEntregado: string
  formatoVentaProductoEntregado: FormatoVentaApi
  cantidadEntregada: string
  saldoResultante: string
  idMedioPago: number | null
  nombreMedioPago: string | null
}

/** Respuesta 200 de la lista. Una pagina fuera de rango trae `devoluciones` vacio, no 404. */
export interface ConsultarDevolucionesResponse {
  fechaHoraServidor: string
  cambios: DevolucionListadoApi[]
  paginacion: PaginacionHistorialApi
}

// --- GET /api/cambios-mercaderia/:idCambio ---

/** Persona que cargo o anulo una devolución. */
export interface UsuarioDevolucionApi {
  idUsuario: number
  nombre: string
}

/** Devolución completa. Es el contenido del detalle, del alta y de la anulacion. */
export interface DevolucionDetalleApi {
  idCambio: number
  fechaHora: string
  estado: EstadoDevolucionApi
  fechaHoraLimiteModificacion: string | null
  /** Texto libre; null en devoluciones anteriores a que se registrara el motivo. */
  motivoCambio: string | null
  ventaVinculada: {
    idVenta: number
    numeroComprobante: string | null
    // Los tres datos del envio de la venta original. Opcionales: el back todavia no los manda en este endpoint.
    modalidadEntrega?: ModalidadEntregaApi
    /** Dato personal: nunca va en un log ni en un mensaje. */
    direccionEnvio?: string | null
    /** Dato personal. */
    destinatarioEnvio?: string | null
  } | null
  articuloDevuelto: {
    idProducto: number
    nombreProducto: string
    formatoVenta: FormatoVentaApi
    cantidadDevuelta: string
    esBolsaAbierta: boolean
    /** Con bolsa abierta es el precio de la bolsa. */
    precioUnitario: string
    /** Con bolsa abierta es el credito de la fraccion devuelta. */
    subtotal: string
  }
  /** Producto que recibio el stock: el devuelto, o su granel si fue bolsa abierta. */
  productoStockIngresado: {
    idProducto: number
    nombreProducto: string
    /** Kilos que ingresaron al granel; solo con bolsa abierta. */
    cantidadStockIngresado: string | null
  }
  articuloEntregado: {
    idProducto: number
    nombreProducto: string
    formatoVenta: FormatoVentaApi
    cantidadEntregada: string
    precioUnitario: string
    subtotal: string
  }
  valorDevuelto: string
  valorEntregado: string
  saldoResultante: string
  /** null si no hubo saldo. No trae el tipo del medio: se cruza con los medios cargados. */
  pagoSaldo: {
    idMedioPago: number
    nombreMedioPago: string
    montoRecibido: string | null
    vuelto: string | null
  } | null
  vendedor: UsuarioDevolucionApi
  /** null mientras este ACTIVA, o si se anulo antes de la auditoria. */
  anulacion: { fechaHora: string; usuario: UsuarioDevolucionApi; motivo: string } | null
}

/** Respuesta 200 del detalle. */
export interface ConsultarDevolucionResponse {
  fechaHoraServidor: string
  cambio: DevolucionDetalleApi
}

// --- POST /api/cambios-mercaderia ---

/**
 * Body del alta. Los opcionales se OMITEN (un null es 400). El usuario sale del token.
 * Con bolsa abierta: `cantidadDevuelta` son bolsas enteras y `pesoDevuelto` son los kilos devueltos.
 */
export interface RegistrarDevolucionRequest {
  idVentaOriginal?: number
  idProductoDevuelto: number
  cantidadDevuelta: number
  esBolsaAbierta: boolean
  /** Solo con bolsa abierta: mayor a 0 y no mayor que pesoUnitario por cantidadDevuelta. */
  pesoDevuelto?: number
  idProductoEntregado: number
  cantidadEntregada: number
  /** Solo si el saldo es mayor a 0. */
  idMedioPago?: number
  /** Solo con medio EFECTIVO y saldo mayor a 0; mayor o igual al saldo. */
  montoRecibido?: number
  /** De 1 a 200 caracteres: la etiqueta del motivo o, con "Otro", el detalle escrito. */
  motivoCambio: string
}

/** Respuesta 201 del alta: la misma devolución que el detalle (los campos planos extra se ignoran). */
export interface RegistrarDevolucionResponse {
  mensaje: string
  fechaHoraServidor: string
  cambio: DevolucionDetalleApi
}

// --- POST /api/cambios-mercaderia/:idCambio/anulacion ---

/** Body de la anulacion (tambien la usa Editar). El back no recibe ni guarda la accion. */
export interface AnularDevolucionRequest {
  /** De 1 a 200 caracteres. */
  motivo: string
}

/** Respuesta 200 de la anulacion: la devolución ya ANULADA y con su `anulacion`. */
export interface AnularDevolucionResponse {
  mensaje: string
  fechaHoraServidor: string
  cambio: DevolucionDetalleApi
}
