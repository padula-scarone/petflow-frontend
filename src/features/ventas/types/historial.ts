import type { EstadoCargaRecurso } from '@/features/ventas/types/carga'
import type { PropiedadesCobro } from '@/features/ventas/types/cobro'
import type { Comprobante } from '@/features/ventas/types/comprobante'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'

// --- ENUMS DEL BACK ---

/** Estado de una venta en el historial. */
export type EstadoVentaHistorial = 'COMPLETADA' | 'PENDIENTE_PAGO' | 'ANULADA'

/** Canal por el que se origino la venta. */
export type OrigenVenta = 'MOSTRADOR' | 'DIGITAL'

/** Forma en que el cliente recibe la mercaderia. */
export type ModalidadEntrega = 'RETIRO' | 'ENVIO'

/** Unidad de venta de un producto. */
export type FormatoVenta = 'UNIDAD' | 'GRANEL'

/** Acciones que exigen confirmacion y estan limitadas por la ventana de seguridad. */
export type AccionVenta = 'EDITAR' | 'ANULAR'

/** Atajos para elegir un rango de fechas. */
export type PeriodoRapido = 'HOY' | 'AYER' | 'ULTIMOS_7_DIAS'

/** Motivos para anular una venta. Valores fijos del back; OTRO exige un detalle escrito. */
export type CodigoMotivoAnulacion =
  | 'VENTA_DUPLICADA'
  | 'PAGO_NO_CONCRETADO'
  | 'CLIENTE_CANCELO'
  | 'PRODUCTO_NO_DISPONIBLE'
  | 'ENVIO_NO_POSIBLE'
  | 'ERROR_DE_CARGA'
  | 'OTRO'

/** Motivos para editar una venta. Valores fijos del back; OTRO exige un detalle escrito. */
export type CodigoMotivoEdicion =
  | 'PRODUCTO_O_CANTIDAD_INCORRECTOS'
  | 'CLIENTE_CAMBIO_PEDIDO'
  | 'MEDIO_DE_PAGO_INCORRECTO'
  | 'DESCUENTO_O_PRECIO_INCORRECTO'
  | 'DATOS_DEL_CLIENTE_INCORRECTOS'
  | 'OTRO'

/** Cualquier motivo de anulacion o edicion. */
export type CodigoMotivo = CodigoMotivoAnulacion | CodigoMotivoEdicion

/** Filtro por medio de pago: un medio puntual, "MIXTO" (2 o mas pagos) o ninguno. */
export type FiltroMedioPago = number | 'MIXTO' | null

// --- LISTA (GET /api/ventas) ---

/** Venta tal como la devuelve la grilla del historial. */
export interface VentaHistorial {
  idVenta: number
  numeroComprobante: string
  /** Fecha y hora de la venta en formato ISO 8601. */
  fechaHora: string
  estado: EstadoVentaHistorial
  /** En un fiado pendiente es el importe adeudado (subtotal menos descuento manual). */
  montoTotal: number
  clienteReferencia: string | null
  origen: OrigenVenta
  modalidadEntrega: ModalidadEntrega
  /**
   * Hasta cuando se puede editar o anular, en ISO 8601: 15 minutos desde el pago si es un fiado saldado,
   * o desde la venta en el resto. null si la venta esta anulada. Lo calcula el back.
   */
  fechaHoraLimiteModificacion: string | null
}

/** Metadatos de paginacion de la respuesta. */
export type PaginacionHistorial = PaginacionResultados

/** Fila lista para renderizar: el hook ya calculo el plazo contra la hora del servidor. */
export interface FilaHistorial extends VentaHistorial {
  /**
   * true mientras se puede editar o anular: no esta anulada y no paso la hora de
   * fechaHoraLimiteModificacion. Cuando vence pasa a false sin que el usuario recargue.
   */
  ventanaVigente: boolean
  /** Un fiado se puede cobrar siempre, sin limite de tiempo. */
  puedeCobrarFiado: boolean
}

// --- FILTROS ---

/** Producto elegido como filtro. */
export interface ProductoFiltro {
  idProducto: number
  nombreProducto: string
}

/** Medio de pago ofrecido como filtro. */
export interface MedioPagoFiltro {
  idMedioPago: number
  nombre: string
}

/** Filtros del historial. Se combinan con AND. */
export interface FiltrosHistorial {
  /** AAAA-MM-DD, inclusiva. */
  fechaDesde: string | null
  /** AAAA-MM-DD, inclusiva. */
  fechaHasta: string | null
  productoSeleccionado: ProductoFiltro | null
  estado: EstadoVentaHistorial | null
  origen: OrigenVenta | null
  /** El hook lo fuerza a null con PENDIENTE_PAGO: un fiado no tiene pagos. */
  medioPago: FiltroMedioPago
  /** Solo se muestra y se usa con estado PENDIENTE_PAGO. */
  textoCliente: string
  numeroComprobante: string
}

/** Datos que necesitan los filtros para mostrar sus opciones. */
export interface OpcionesFiltros {
  mediosPago: MedioPagoFiltro[]
  textoBusquedaProducto: string
  productosCoincidentes: ProductoFiltro[]
}

/** Los cinco estados de la lista; "sin-ventas" y "sin-resultados" son distintos a proposito. */
export type EstadoListaHistorial =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  /** No hay ventas y no hay filtros activos. */
  | { tipo: 'sin-ventas' }
  /** Hay ventas, pero los filtros activos no devuelven ninguna. */
  | { tipo: 'sin-resultados' }
  | { tipo: 'con-ventas'; filas: FilaHistorial[]; paginacion: PaginacionHistorial }

// --- DETALLE (GET /api/ventas/:idVenta) ---

/** Renglon de producto de una venta. */
export interface ItemVentaDetalle {
  idProducto: number
  nombreProducto: string
  formatoVenta: FormatoVenta
  /** Admite decimales cuando el formato es GRANEL. */
  cantidad: number
  precioUnitario: number
  subtotal: number
}

/** Pago registrado con un medio. */
export interface PagoVentaDetalle {
  idMedioPago: number
  nombreMedioPago: string
  /** Parte del importe cubierta por este medio, antes de su ajuste. */
  montoBase: number
  /** Negativo = descuento, positivo = recargo. */
  porcentajeAplicado: number
  montoFinal: number
  /** Si el medio es efectivo (cruzado con los medios cargados). Solo entonces hay recibido y vuelto. */
  admiteVuelto: boolean
  /** Solo efectivo. */
  montoRecibido: number | null
  vuelto: number | null
}

/** Usuario que registro la venta. */
export interface VendedorVenta {
  idUsuario: number
  nombre: string
}

/**
 * Quien anulo la venta, cuando y por que. Usuario y fecha y hora los asigna el servidor.
 * El back no guarda codigos de motivo: guarda el texto que armo el front (ver construirTextoMotivo).
 */
export interface DatosAnulacion {
  /** Texto libre de 1 a 200 caracteres, tal como se guardo. */
  motivo: string
  idUsuario: number
  nombreUsuario: string
  /** ISO 8601. */
  fechaHora: string
}

/** Venta completa con sus items y pagos. */
export interface VentaDetalle extends VentaHistorial {
  /** null mientras la venta no esta anulada. */
  anulacion: DatosAnulacion | null
  /** null mientras el fiado no se cobro. */
  fechaHoraPago: string | null
  vendedor: VendedorVenta
  subtotalBruto: number
  descuentoManual: number
  motivoDescuento: string | null
  items: ItemVentaDetalle[]
  /** Vacio en un fiado pendiente o en una venta anulada que era un fiado. */
  pagos: PagoVentaDetalle[]
}

/** Estado del panel de detalle. null (fuera de este tipo) significa panel cerrado. */
export type EstadoDetalleVenta =
  | { tipo: 'cargando'; idVenta: number }
  | { tipo: 'error'; idVenta: number; mensaje: string }
  | { tipo: 'listo'; venta: VentaDetalle; fila: FilaHistorial }

// --- ACCIONES ---

/** Por que fallo una accion sobre una venta (anular, editar o cobrar un fiado). */
export interface ErrorAccionVenta {
  /**
   * 400: dato invalido. 403: ventana vencida (o sin permiso). 404: la venta no existe. 409: conflicto de
   * estado o sin caja abierta. null: no hubo respuesta del servidor y no se pudo confirmar el resultado.
   */
  estadoHttp: 400 | 403 | 404 | 409 | null
  /** Texto para la vista; nunca el mensaje tecnico del back. */
  mensaje: string
  /** true si no se sabe si la accion se aplico: reintentar es seguro, el back responde 409 a la repeticion. */
  incierto: boolean
  /** false cuando repetir la accion no tiene sentido (la venta no existe o ya la resolvio otra persona). */
  reintentable: boolean
}

/** Confirmacion abierta de editar o anular. */
export interface ConfirmacionAccionVenta {
  accion: AccionVenta
  fila: FilaHistorial
  enviando: boolean
  error: ErrorAccionVenta | null
  /** null hasta que se elige uno: no hay opcion preseleccionada. */
  codigoMotivo: CodigoMotivo | null
  /** Lo escrito en "Otro". Vacio con cualquier otro motivo. */
  detalleMotivo: string
  /** Hay motivo elegido y, si es OTRO, un detalle de 1 a 200 caracteres. */
  motivoValido: boolean
}

/** Mensaje de exito que se muestra sobre la lista. */
export interface AvisoHistorial {
  mensaje: string
}

/**
 * Recibo que se ofrece despues de cobrar un fiado. El comprobante sale de GET /api/ventas/:idVenta: si ese
 * pedido falla el cobro igual se hizo, y quedan en null el comprobante y los enlaces ("Ver recibo" reintenta).
 */
export interface ReciboFiado {
  comprobante: Comprobante | null
  enlaceWhatsApp: string | null
  enlaceMail: string | null
  /** Suma de los vueltos en efectivo; null si no hubo. */
  vuelto: number | null
  /** Total realmente cobrado, con los recargos y descuentos del dia. */
  montoTotalCobrado: number
}

// --- PROPS ---

/** Props del panel de filtros. */
export interface PropiedadesFiltrosHistorial {
  filtros: FiltrosHistorial
  opciones: OpcionesFiltros
  cantidadFiltrosActivos: number
  /** Cuantos de los filtros de "Mas filtros" (origen, medio de pago, comprobante) estan activos. */
  cantidadFiltrosAdicionales: number
  /** Atajo que coincide con el rango elegido, o null si es un rango propio o no hay fechas. */
  periodoRapidoActivo: PeriodoRapido | null
  /** Total de la ultima consulta, para el boton "Ver n ventas" del Sheet mobile. */
  totalResultados: number | null
  onCambiarFiltros: (cambios: Partial<FiltrosHistorial>) => void
  onSeleccionarPeriodoRapido: (periodo: PeriodoRapido) => void
  onBuscarProducto: (textoBusqueda: string) => void
  onSeleccionarProducto: (producto: ProductoFiltro | null) => void
  onLimpiarFiltros: () => void
}

/** Callbacks de las acciones sobre una venta. */
export interface PropiedadesAccionesVenta {
  onVerDetalle: (idVenta: number) => void
  /** Abre la confirmacion de editar o anular. */
  onSolicitarAccion: (accion: AccionVenta, idVenta: number) => void
  onCobrarFiado: (idVenta: number) => void
}

/** Props del componente presentacional de la seccion Historial. */
export interface HistorialVentasProps {
  estadoLista: EstadoListaHistorial
  propiedadesFiltros: PropiedadesFiltrosHistorial
  acciones: PropiedadesAccionesVenta
  aviso: AvisoHistorial | null
  /** null mientras el panel de detalle esta cerrado. */
  detalle: EstadoDetalleVenta | null
  /** null mientras no hay una confirmacion abierta. */
  confirmacion: ConfirmacionAccionVenta | null
  onCambiarPagina: (pagina: number) => void
  onReintentar: () => void
  onCerrarAviso: () => void
  onCerrarDetalle: () => void
  onReintentarDetalle: () => void
  /** Confirma la edicion: anula la venta y reabre Registrar Venta. */
  onEditarVenta: (idVenta: number) => void
  /** Confirma la anulacion (baja logica). */
  onAnularVenta: (idVenta: number) => void
  onCancelarConfirmacion: () => void
  onSeleccionarMotivo: (codigoMotivo: CodigoMotivo) => void
  onCambiarDetalleMotivo: (detalleMotivo: string) => void
}

/** Props del dialogo de cobro de un fiado. */
export interface CobroFiadoProps {
  fila: FilaHistorial
  /** Carga del detalle de la venta, de donde sale el importe adeudado. */
  estadoImporte: EstadoCargaRecurso
  onReintentarImporte: () => void
  /** Subtotal bruto menos descuento manual del detalle. 0 mientras no cargo. */
  importeAdeudado: number
  /** Carga de los medios de pago activos: sin ellos no hay con que cobrar. */
  estadoMediosPago: EstadoCargaRecurso
  onReintentarMediosPago: () => void
  /** Cobro unico o mixto reutilizado de Registrar Venta. */
  propiedadesCobro: PropiedadesCobro
  enviando: boolean
  error: ErrorAccionVenta | null
  /** Distinto de null cuando el cobro se confirmo: pasa al paso "cobrado". */
  recibo: ReciboFiado | null
  onConfirmarCobro: () => void
  onCerrar: () => void
  onVerRecibo: () => void
  /** Tras un 404 o 409, cierra el dialogo y vuelve a consultar la lista. */
  onActualizarListado: () => void
}
