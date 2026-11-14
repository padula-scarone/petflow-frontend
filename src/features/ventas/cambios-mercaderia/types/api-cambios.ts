import type { FormatoVentaApi, PaginacionHistorialApi } from '@/features/ventas/types/api-ventas'

// Contrato crudo del back para Cambios posventa (modulo cambios-mercaderia). Solo lo usa la capa api: el
// resto del front trabaja con los tipos de dominio de types/cambio.ts (montos en pesos, cantidades numericas).
// Montos y cantidades llegan como texto exacto: importes con 2 decimales y cantidades con 3.

/** Estado de un cambio. ANULADO es baja logica. */
export type EstadoCambioApi = 'ACTIVO' | 'ANULADO'

/** Filtro por vinculo con una venta original. */
export type VinculoCambioApi = 'VINCULADO' | 'DESVINCULADO'

/** Valor de `codigo` en los errores de Cambios. Los 401 y 403 de autenticacion no lo traen. */
export type CodigoErrorCambio =
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
export interface ConsultaCambiosApi {
  pagina: number
  /** Por defecto 20, maximo 100. */
  cantidadPorPagina: number
  /** AAAA-MM-DD, inclusiva, hora de Argentina. No puede ser posterior a fechaHasta. */
  fechaDesde?: string
  fechaHasta?: string
  /** Coincide con el producto devuelto o con el entregado. */
  idProducto?: number
  estado?: EstadoCambioApi
  vinculo?: VinculoCambioApi
  /** Un cambio con saldo 0 no tiene medio y no coincide. */
  idMedioPago?: number
}

/** Fila de la lista. */
export interface CambioListadoApi {
  idCambio: number
  /** ISO 8601. */
  fechaHora: string
  estado: EstadoCambioApi
  /** null si esta ANULADO. */
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

/** Respuesta 200 de la lista. Una pagina fuera de rango trae `cambios` vacio, no 404. */
export interface ConsultarCambiosResponse {
  fechaHoraServidor: string
  cambios: CambioListadoApi[]
  paginacion: PaginacionHistorialApi
}

// --- GET /api/cambios-mercaderia/:idCambio ---

/** Persona que cargo o anulo un cambio. */
export interface UsuarioCambioApi {
  idUsuario: number
  nombre: string
}

/** Cambio completo. Es el contenido del detalle, del alta y de la anulacion. */
export interface CambioDetalleApi {
  idCambio: number
  fechaHora: string
  estado: EstadoCambioApi
  fechaHoraLimiteModificacion: string | null
  /** Texto libre; null en cambios anteriores a que se registrara el motivo. */
  motivoCambio: string | null
  ventaVinculada: { idVenta: number; numeroComprobante: string | null } | null
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
  vendedor: UsuarioCambioApi
  /** null mientras este ACTIVO, o si se anulo antes de la auditoria. */
  anulacion: { fechaHora: string; usuario: UsuarioCambioApi; motivo: string } | null
}

/** Respuesta 200 del detalle. */
export interface ConsultarCambioResponse {
  fechaHoraServidor: string
  cambio: CambioDetalleApi
}

// --- POST /api/cambios-mercaderia ---

/**
 * Body del alta. Los opcionales se OMITEN (un null es 400). El usuario sale del token.
 * Con bolsa abierta: `cantidadDevuelta` son bolsas enteras y `pesoDevuelto` son los kilos devueltos.
 */
export interface RegistrarCambioRequest {
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

/** Respuesta 201 del alta: el mismo cambio que el detalle (los campos planos extra se ignoran). */
export interface RegistrarCambioResponse {
  mensaje: string
  fechaHoraServidor: string
  cambio: CambioDetalleApi
}

// --- POST /api/cambios-mercaderia/:idCambio/anulacion ---

/** Body de la anulacion (tambien la usa Editar). El back no recibe ni guarda la accion. */
export interface AnularCambioRequest {
  /** De 1 a 200 caracteres. */
  motivo: string
}

/** Respuesta 200 de la anulacion: el cambio ya ANULADO y con su `anulacion`. */
export interface AnularCambioResponse {
  mensaje: string
  fechaHoraServidor: string
  cambio: CambioDetalleApi
}
