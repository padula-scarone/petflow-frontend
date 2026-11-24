import type { PagoRequest } from '@/features/ventas/types/api-ventas'

// Forma exacta de lo que viaja con el back en Deudores y cuentas corrientes. Los montos llegan como texto con
// 2 decimales y se convierten en un solo lugar (api/conversores-deudores.ts). El DNI y el telefono nunca se escriben
// en un mensaje de error ni en un log (RNF-VENTAS-03); la busqueda por DNI viaja en la URL solo porque asi es el contrato.

/** Deudor tal como lo devuelve el back. El telefono llega ya normalizado: solo digitos, de 11 a 15. */
export interface DeudorApi {
  idDeudor: number
  nombreCompleto: string
  telefono: string
  dni: string
}

/** Metadatos de paginacion, iguales a los del Historial. */
export interface PaginacionApi {
  pagina: number
  cantidadPorPagina: number
  totalRegistros: number
  totalPaginas: number
}

// --- GET /api/deudores ---

/** Query de la busqueda de deudores de Registrar Venta. */
export interface ConsultaDeudoresApi {
  /** Nombre o DNI, parcial. Un texto vacio trae a todos: por eso nunca se consulta sin texto. */
  busqueda: string
  cantidadPorPagina: number
}

/** Respuesta 200 de GET /api/deudores. */
export interface ConsultarDeudoresResponse {
  deudores: DeudorApi[]
  paginacion: PaginacionApi
}

// --- POST /api/deudores y PUT /api/deudores/:idDeudor ---

/** Body del alta y de la edicion (el mismo esquema). El telefono va solo con digitos y con el codigo de pais. */
export interface DatosDeudorRequest {
  nombreCompleto: string
  telefono: string
  dni: string
}

/** Respuesta del alta (201) y de la edicion (200). */
export interface GuardarDeudorResponse {
  mensaje: string
  deudor: DeudorApi
}

/** Codigos de los errores del modulo de deudores. */
export type CodigoErrorDeudorApi = 'DEUDOR_NO_ENCONTRADO' | 'DNI_DUPLICADO'

// --- GET /api/cuentas-corrientes ---

/** Criterios de orden de la lista de Deudores, como los escribe el back. */
export type OrdenarPorApi = 'nombre' | 'fiadosPendientes' | 'saldo' | 'fechaFiado' | 'proximoPago'

/** Query de la lista de Deudores. `sentido` solo se manda junto con `ordenarPor`; lo vacio se omite. */
export interface ConsultaCuentasCorrientesApi {
  pagina: number
  cantidadPorPagina: number
  texto?: string
  incluirSinDeuda?: 'true' | 'false'
  /** Filtro por proximo pago. El back todavia no lo tiene: hasta que lo despliegue, mandarlo da 400. */
  proximoPago?: ProximoPagoApi
  ordenarPor?: OrdenarPorApi
  sentido?: 'asc' | 'desc'
}

/** Valores del filtro por proximo pago, como los escribe el back. */
export type ProximoPagoApi = 'hoy' | 'estaSemana' | 'vencidos' | 'sinFecha'

/** Un deudor de la lista, con su saldo. Sin telefono. */
export interface FilaCuentaCorrienteApi {
  idDeudor: number
  nombreCompleto: string
  dni: string
  saldo: string
  cantidadFiadosPendientes: number
  /** ISO 8601: la venta del fiado pendiente mas antiguo. */
  fiadoDesde: string | null
  /** AAAA-MM-DD: la fecha estimada mas temprana entre sus fiados pendientes, vencidas incluidas. */
  proximaFechaEstimadaPago: string | null
}

/** Respuesta 200 de GET /api/cuentas-corrientes. Una pagina fuera de rango llega con la lista vacia. */
export interface ConsultarCuentasCorrientesResponse {
  cuentasCorrientes: FilaCuentaCorrienteApi[]
  paginacion: PaginacionApi
}

// --- GET /api/cuentas-corrientes/:idDeudor ---

/** Un pago que recibio un fiado: lo aplicado a ESE fiado, no el total del cobro. */
export interface PagoDeFiadoApi {
  idCobroDeudor: number
  /** REC- y 8 digitos. La columna es nullable en el back. */
  numeroRecibo: string | null
  fechaHora: string
  monto: string
}

/** Un fiado pendiente en el estado de cuenta. */
export interface FiadoDeEstadoCuentaApi {
  idVenta: number
  numeroComprobante: string | null
  fechaHora: string
  fechaEstimadaPago: string | null
  vencido: boolean
  importeAdeudado: string
  yaPagado: string
  falta: string
  /** Del mas viejo al mas nuevo. */
  pagos: PagoDeFiadoApi[]
}

/** Respuesta 200 del estado de cuenta. Solo trae fiados pendientes: uno completado desaparece. */
export interface EstadoCuentaResponse {
  deudor: DeudorApi
  saldo: string
  fiados: FiadoDeEstadoCuentaApi[]
}

// --- POST /api/cuentas-corrientes/:idDeudor/cobros ---

/** Un fiado a cobrar: el monto es la porcion base, mayor a 0 y no mayor a lo que falta. */
export interface FiadoACobrarRequest {
  idVenta: number
  monto: number
}

/** Body del cobro. La suma de los `monto` de `pagos` debe ser exactamente la de `fiados`. */
export interface RegistrarCobroRequest {
  fiados: FiadoACobrarRequest[]
  pagos: PagoRequest[]
}

/** Un pago del recibo, con el ajuste del medio congelado. */
export interface PagoDeCobroApi {
  idMedioPago: number
  nombreMedioPago: string
  montoBase: string
  porcentajeAplicado: string
  montoFinal: string
  montoRecibido: string | null
  vuelto: string | null
}

/** Un fiado dentro del recibo recien emitido. */
export interface FiadoCobradoApi {
  idVenta: number
  numeroComprobante: string | null
  montoAbonado: string
  faltaAntes: string
  faltaDespues: string
  estado: 'PENDIENTE_PAGO' | 'COMPLETADA'
}

/** Respuesta 201 del cobro. `saldoDeudorDespues` es el saldo TOTAL del deudor. */
export interface RegistrarCobroResponse {
  cobro: { idCobroDeudor: number; numeroRecibo: string; fechaHora: string }
  deudor: DeudorApi
  fiados: FiadoCobradoApi[]
  pagos: PagoDeCobroApi[]
  totalAbonado: string
  totalCobrado: string
  saldoDeudorDespues: string
}

/** Codigos de los errores del cobro. */
export type CodigoErrorCobroApi =
  | 'FIADO_NO_ENCONTRADO'
  | 'FIADO_NO_PENDIENTE'
  | 'MONTO_EXCEDE_FALTA'
  | 'SIN_CAJA_ABIERTA'
  | 'COBRO_SIMULTANEO'
  | 'COBRO_NO_ENCONTRADO'
  | 'DEUDOR_NO_ENCONTRADO'

// --- GET /api/cuentas-corrientes/cobros/:idCobroDeudor ---

/** Respuesta 200 del recibo de un cobro ya guardado: sin saldo, sin faltas, sin DNI ni telefono. */
export interface ConsultarCobroResponse {
  cobro: { idCobroDeudor: number; numeroRecibo: string | null; fechaHora: string }
  deudor: { idDeudor: number; nombreCompleto: string }
  usuario: { idUsuario: number; nombre: string }
  fiados: { idVenta: number; numeroComprobante: string | null; montoAbonado: string }[]
  pagos: PagoDeCobroApi[]
  totalCobrado: string
}
