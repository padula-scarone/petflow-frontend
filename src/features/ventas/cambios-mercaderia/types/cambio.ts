import type { CodigoErrorCambio } from '@/features/ventas/cambios-mercaderia/types/api-cambios'
import type { EstadoCargaRecurso } from '@/features/ventas/types/carga'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type { PaginacionResultados, RangoFechasFiltro } from '@/features/ventas/types/compartidos'
import type {
  FiltroMedioPago,
  FormatoVenta,
  ItemVentaDetalle,
  OpcionesFiltros,
  OrigenVenta,
  PeriodoRapido,
  ProductoFiltro,
  VentaDetalle,
  VentaHistorialConsultada,
} from '@/features/ventas/types/historial'

// --- ENUMS DEL BACK ---

/** Estado de un cambio (enum EstadoCambio del back). ANULADO es baja logica (RF-GENERAL-01). */
export type EstadoCambio = 'ACTIVO' | 'ANULADO'

/** Acciones que exigen confirmacion y estan limitadas por la ventana de 15 minutos. */
export type AccionCambio = 'EDITAR' | 'ANULAR'

/** Filtro: el cambio tiene venta original o no. */
export type VinculoCambio = 'VINCULADO' | 'DESVINCULADO'

/**
 * Motivos de un cambio. OTRO exige un detalle escrito. Lista a validar con el negocio. Son solo opciones de
 * la pantalla: el back no guarda codigos, guarda el texto que se arma con construirTextoMotivo.
 */
export type CodigoMotivoCambio =
  | 'PRODUCTO_DEFECTUOSO'
  | 'NO_LE_GUSTO_A_LA_MASCOTA'
  | 'ERROR_EN_LA_ENTREGA'
  | 'MEDIDA_INCORRECTA'
  | 'OTRO'

/** Motivos para anular un cambio. */
export type CodigoMotivoAnulacionCambio =
  | 'CAMBIO_DUPLICADO'
  | 'ERROR_DE_CARGA'
  | 'CLIENTE_SE_ARREPINTIO'
  | 'DEVOLUCION_NO_CONCRETADA'
  | 'OTRO'

/** Motivos para editar un cambio (que internamente lo anula y reabre el alta). */
export type CodigoMotivoEdicionCambio =
  | 'ARTICULO_DEVUELTO_INCORRECTO'
  | 'ARTICULO_ENTREGADO_INCORRECTO'
  | 'CANTIDAD_O_PESO_INCORRECTOS'
  | 'VENTA_VINCULADA_INCORRECTA'
  | 'MEDIO_DE_PAGO_INCORRECTO'
  | 'OTRO'

/** Cualquier motivo con el que se anula un cambio: el de anular o el de editar. */
export type CodigoMotivoAccionCambio = CodigoMotivoAnulacionCambio | CodigoMotivoEdicionCambio

// --- LISTA (GET /api/cambios-mercaderia) ---

/** Venta original de un cambio, tal como se muestra en la grilla. */
export interface VentaVinculadaResumen {
  idVenta: number
  numeroComprobante: string
}

/** Articulo de un cambio, resumido para la grilla. */
export interface ProductoCambioListado {
  idProducto: number
  nombreProducto: string
  formatoVenta: FormatoVenta
  /** Unidades, o kg si el formato es GRANEL. En un devuelto con bolsa abierta son bolsas enteras. */
  cantidad: number
}

export interface ProductoDevueltoListado extends ProductoCambioListado {
  esBolsaAbierta: boolean
  /** Kilos que entraron al granel; solo con bolsa abierta (entonces `cantidad` son bolsas enteras). */
  pesoDevueltoKg: number | null
}

/** Cambio tal como lo devuelve la grilla. */
export interface CambioMercaderiaListado {
  idCambio: number
  /** ISO 8601. */
  fechaHora: string
  estado: EstadoCambio
  /** null = cambio desvinculado. */
  ventaVinculada: VentaVinculadaResumen | null
  productoDevuelto: ProductoDevueltoListado
  productoEntregado: ProductoCambioListado
  /** Mayor o igual a 0. Es lo que entra a la caja. */
  saldoResultante: number
  /** null cuando no hubo saldo que cobrar. */
  idMedioPago: number | null
  nombreMedioPago: string | null
  /** Hasta cuando se puede editar o anular, en ISO 8601; lo calcula el back. null si esta anulado. */
  fechaHoraLimiteModificacion: string | null
}

/** Fila lista para renderizar: el hook ya evaluo la ventana contra la hora del servidor. */
export interface FilaCambio extends CambioMercaderiaListado {
  /**
   * true mientras se puede editar o anular: esta ACTIVO y no paso la hora de
   * fechaHoraLimiteModificacion. Al vencer pasa a false sin que el usuario recargue.
   */
  ventanaVigente: boolean
}

// --- FILTROS DE LA LISTA ---

/** Filtros de la lista de cambios. Se combinan con AND. */
export interface FiltrosCambios extends RangoFechasFiltro {
  /** Coincide con el producto devuelto o con el entregado. */
  productoSeleccionado: ProductoFiltro | null
  estado: EstadoCambio | null
  vinculo: VinculoCambio | null
  /** Medio de pago del saldo. Es uno solo: en un cambio no existe "Mixto". */
  medioPago: number | null
}

/** Los cinco estados de la lista; "sin-cambios" y "sin-resultados" son distintos a proposito. */
export type EstadoListaCambios =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  /** No hay cambios y no hay filtros activos. */
  | { tipo: 'sin-cambios' }
  /** Hay cambios, pero los filtros activos no devuelven ninguno. */
  | { tipo: 'sin-resultados' }
  | { tipo: 'con-cambios'; filas: FilaCambio[]; paginacion: PaginacionResultados }

// --- DETALLE (GET /api/cambios-mercaderia/:idCambio) ---

/** Un articulo del cambio con su precio y su subtotal. */
export interface ArticuloCambioDetalle {
  idProducto: number
  nombreProducto: string
  formatoVenta: FormatoVenta
  /** Unidades, o kg si el formato es GRANEL. En un devuelto con bolsa abierta son bolsas enteras. */
  cantidad: number
  /** En un articulo devuelto con bolsa abierta es el precio de la BOLSA. */
  precioUnitario: number
  /** En un articulo devuelto con bolsa abierta es el credito de la fraccion devuelta. */
  subtotal: number
}

export interface ArticuloDevueltoDetalle extends ArticuloCambioDetalle {
  esBolsaAbierta: boolean
  /** Kilos que entraron al granel; solo con bolsa abierta. */
  pesoDevueltoKg: number | null
  /** Producto que recibio el stock: el granel si fue bolsa abierta, el mismo producto si no. */
  idProductoStockIngresado: number
  nombreProductoStockIngresado: string
}

/** Como se cobro el saldo. */
export interface PagoSaldoCambio {
  idMedioPago: number
  nombreMedioPago: string
  /** Solo efectivo. */
  montoRecibido: number | null
  vuelto: number | null
}

/**
 * Quien anulo el cambio, por que y cuando. Usuario y fecha y hora los asigna el servidor. El back no guarda
 * codigos de motivo ni distingue una baja de una edicion: guarda el texto que armo el front.
 */
export interface DatosAnulacionCambio {
  /** Texto libre de 1 a 200 caracteres, tal como se guardo. */
  motivo: string
  idUsuario: number
  nombreUsuario: string
  /** ISO 8601. */
  fechaHora: string
}

/** Cambio completo. */
export interface CambioMercaderiaDetalle
  extends Pick<
    CambioMercaderiaListado,
    | 'idCambio'
    | 'fechaHora'
    | 'estado'
    | 'ventaVinculada'
    | 'saldoResultante'
    | 'fechaHoraLimiteModificacion'
  > {
  articuloDevuelto: ArticuloDevueltoDetalle
  articuloEntregado: ArticuloCambioDetalle
  valorDevuelto: number
  valorEntregado: number
  /** null si no hubo saldo. */
  pagoSaldo: PagoSaldoCambio | null
  /** Texto libre con el que se cargo el cambio; null en cambios anteriores a que se guardara. */
  motivoCambio: string | null
  vendedor: { idUsuario: number; nombre: string }
  /** null mientras el cambio este ACTIVO. */
  anulacion: DatosAnulacionCambio | null
}

/** Estado del panel de detalle. null (fuera de este tipo) significa panel cerrado. */
export type EstadoDetalleCambio =
  | { tipo: 'cargando'; idCambio: number }
  | { tipo: 'error'; idCambio: number; mensaje: string }
  | { tipo: 'listo'; cambio: CambioMercaderiaDetalle; fila: FilaCambio }

// --- ERRORES DE UNA ACCION ---

/** Por que fallo una accion sobre un cambio (alta, anulacion o edicion). El texto es propio, nunca el del back. */
export interface ErrorAccionCambio {
  /**
   * 400: datos o regla invalidos. 403: ventana vencida (o sin permiso). 404: no existe. 409: conflicto de
   * estado, caja o stock. null: no hubo respuesta del servidor y no se pudo confirmar el resultado.
   */
  estadoHttp: 400 | 403 | 404 | 409 | null
  /** Caso del rechazo segun el back; null si el back no lo informa (permiso, sin respuesta). */
  codigo: CodigoErrorCambio | null
  /** Texto para la vista; nunca el mensaje tecnico del back. */
  mensaje: string
  /** true si no se sabe si la accion se aplico: no se reenvia a ciegas. */
  incierto: boolean
  /** false cuando repetir la accion no tiene sentido (el cambio no existe o ya lo resolvio otra persona). */
  reintentable: boolean
}

// --- CONFIRMACION DE EDITAR / ANULAR ---

/** Confirmacion abierta de editar o anular un cambio. */
export interface ConfirmacionAccionCambio {
  accion: AccionCambio
  fila: FilaCambio
  enviando: boolean
  error: ErrorAccionCambio | null
  /** null hasta que se elige uno: no hay opcion preseleccionada. */
  codigoMotivo: string | null
  /** Lo escrito en "Otro". Vacio con cualquier otro motivo. */
  detalleMotivo: string
  /** Hay motivo elegido y, si es OTRO, un detalle de 1 a 200 caracteres. */
  motivoValido: boolean
}

// --- ALTA: VENTA VINCULABLE ---

/**
 * Venta que aparece en la busqueda de vinculacion, con la cantidad de cambios ACTIVOS que ya tiene.
 * Solo llegan COMPLETADA (config/reglas-cambios.ts).
 */
export type VentaVinculable = VentaHistorialConsultada

/** Renglon de la venta vinculada, con lo ya devuelto por cambios ACTIVOS anteriores. */
export interface ItemVentaVinculable extends ItemVentaDetalle {
  /** En unidades (o kg si el renglon es GRANEL), de cambios ACTIVOS. Una bolsa abierta cuenta como 1 unidad. */
  cantidadYaDevuelta: number
  /** Granel vinculado y peso por bolsa: salen del catalogo (el detalle de la venta no los trae). */
  idProductoGranel: number | null
  nombreProductoGranel: string | null
  pesoNominalKg: number | null
  pesoNominalMilesimas: number | null
}

/** Venta elegida para vincular. Nunca se modifica: solo se consulta para elegir el articulo. */
export interface VentaVinculada extends Omit<VentaDetalle, 'items'> {
  items: ItemVentaVinculable[]
}

// --- ALTA: ARTICULOS Y SALDO ---

/** Datos de "Bolsa abierta". Si un producto no la admite, el interruptor no se muestra. */
export interface OpcionBolsaAbierta {
  idProductoGranel: number
  nombreProductoGranel: string
  pesoNominalKg: number
  /** El mismo peso en milesimas de kg: el calculo del saldo se hace con enteros. */
  pesoNominalMilesimas: number
  /**
   * Solo para MOSTRAR: precio de la bolsa (el del renglon de la venta, o el vigente sin venta) dividido su peso.
   * El credito no se calcula con este numero sino con el precio de la bolsa, para redondear una sola vez como el back.
   */
  precioPorKg: number
}

/** Producto del catalogo que puede devolverse o entregarse. */
export interface ProductoCatalogoCambio {
  idProducto: number
  nombreProducto: string
  formatoVenta: FormatoVenta
  precioUnitario: number
  stockDisponible: number
  urlImagen?: string
  /** null: el producto no tiene variante a granel. */
  opcionBolsaAbierta: OpcionBolsaAbierta | null
}

/** Articulo devuelto (entra) mientras se carga el cambio. */
export interface ArticuloDevueltoCargado {
  idProducto: number
  nombreProducto: string
  formatoVenta: FormatoVenta
  origen: 'VENTA' | 'CATALOGO'
  /** El pagado en la venta o el actual del catalogo. */
  precioUnitario: number
  /** Unidades (o kg si el producto es GRANEL). Con bolsa abierta queda fija en 1. */
  cantidad: number | null
  /** Solo con venta: lo vendido menos lo ya devuelto. */
  cantidadMaximaDisponible: number | null
  cantidadYaDevuelta: number
  /** null: sin variante a granel, no se muestra el interruptor. */
  opcionBolsaAbierta: OpcionBolsaAbierta | null
  esBolsaAbierta: boolean
  /** Solo con bolsa abierta; precargado con el peso nominal. Viaja como pesoDevuelto (cantidadDevuelta es 1). */
  pesoDevueltoKg: number | null
}

/** Articulo entregado (sale) mientras se carga el cambio. */
export interface ArticuloEntregadoCargado {
  idProducto: number
  nombreProducto: string
  formatoVenta: FormatoVenta
  precioUnitario: number
  stockDisponible: number
  cantidad: number | null
}

/** Todo lo que el usuario fue cargando en el alta. */
export interface BorradorCambio {
  ventaVinculada: VentaVinculada | null
  articuloDevuelto: ArticuloDevueltoCargado | null
  articuloEntregado: ArticuloEntregadoCargado | null
  idMedioPago: number | null
  /** "Paga con": solo efectivo. */
  montoRecibido: number | null
  codigoMotivo: CodigoMotivoCambio | null
  /** Lo escrito en "Otro". Vacio con cualquier otro motivo. */
  detalleMotivo: string
}

/** Alta repoblada al editar un cambio, con lo que no se pudo repoblar. */
export interface AltaRepoblada {
  borrador: BorradorCambio
  /** Por ejemplo "La venta vinculada ya no se puede vincular": se repuebla el resto sin bloquear. */
  avisos: string[]
}

/** Resultado de comparar lo que entra con lo que sale. */
export type SituacionSaldo = 'INCOMPLETO' | 'A_COBRAR' | 'SIN_DIFERENCIA' | 'NEGATIVO'

export interface ResumenSaldoCambio {
  valorDevuelto: number
  valorEntregado: number
  /** Valor entregado menos valor devuelto, calculado en centavos como el back. */
  saldo: number
  situacion: SituacionSaldo
  /** Solo en efectivo con monto recibido suficiente. */
  vuelto: number | null
}

export type PasoAltaCambio = 'MOTIVO' | 'VENTA_ORIGINAL' | 'ARTICULOS' | 'COBRO'

/** Que se puede hacer con lo cargado hasta ahora y por que no. */
export interface ValidacionCambio {
  /** true si el paso esta completo y se puede salir de el. En COBRO equivale a poder confirmar. */
  puedeAvanzar: Record<PasoAltaCambio, boolean>
  puedeConfirmar: boolean
  /** Por que esta bloqueado el boton del paso actual; null si no esta bloqueado. */
  motivoNoAvanzar: string | null
  erroresCampo: {
    cantidadDevuelta?: string
    pesoDevuelto?: string
    cantidadEntregada?: string
    montoRecibido?: string
  }
}

// --- ALTA: BUSQUEDA DE VENTA ---

/** Filtros para buscar la venta a vincular. Se combinan con AND. */
export interface FiltrosBusquedaVenta extends RangoFechasFiltro {
  productoSeleccionado: ProductoFiltro | null
  origen: OrigenVenta | null
  medioPago: FiltroMedioPago
  /** Por ejemplo CMP-00000012. */
  numeroComprobante: string
}

export type EstadoBusquedaVenta =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  | { tipo: 'sin-resultados' }
  | { tipo: 'con-resultados'; ventas: VentaVinculable[]; paginacion: PaginacionResultados }

export type EstadoEnvioCambio =
  | { tipo: 'inactivo' }
  | { tipo: 'enviando' }
  | { tipo: 'error'; error: ErrorAccionCambio }
  /**
   * No se sabe si el cambio se guardo (sin red, tiempo agotado, 5xx o respuesta ilegible). No se reenvia:
   * se puede volver a verificar o revisar la lista.
   */
  | { tipo: 'incierto'; mensaje: string; verificando: boolean }
  | { tipo: 'exito'; cambio: CambioMercaderiaDetalle }

// --- PROPS ---

/** Props del panel de filtros de la lista de cambios. */
export interface PropiedadesFiltrosCambios {
  filtros: FiltrosCambios
  opciones: OpcionesFiltros
  cantidadFiltrosActivos: number
  /** Cuantos de los filtros de "Mas filtros" (vinculo y medio de pago) estan activos. */
  cantidadFiltrosAdicionales: number
  periodoRapidoActivo: PeriodoRapido | null
  /** Total de la ultima consulta, para el boton "Ver n cambios" de la hoja mobile. */
  totalResultados: number | null
  onCambiarFiltros: (cambios: Partial<FiltrosCambios>) => void
  onSeleccionarPeriodoRapido: (periodo: PeriodoRapido) => void
  onBuscarProducto: (textoBusqueda: string) => void
  onSeleccionarProducto: (producto: ProductoFiltro | null) => void
  onLimpiarFiltros: () => void
}

/** Callbacks de las acciones sobre un cambio. */
export interface PropiedadesAccionesCambio {
  onVerDetalleCambio: (idCambio: number) => void
  /** Abre la confirmacion con motivo; no ejecuta nada todavia. */
  onEditarCambio: (idCambio: number) => void
  /** Abre la confirmacion con motivo; no ejecuta nada todavia. */
  onAnularCambio: (idCambio: number) => void
}

/** Mensaje de exito que se muestra sobre la lista. */
export interface AvisoCambios {
  mensaje: string
}

/** Props del componente presentacional de la seccion Cambios posventa. */
export interface CambiosPosventaProps {
  estadoLista: EstadoListaCambios
  propiedadesFiltros: PropiedadesFiltrosCambios
  acciones: PropiedadesAccionesCambio
  aviso: AvisoCambios | null
  /** null mientras el panel de detalle esta cerrado. */
  detalle: EstadoDetalleCambio | null
  /** null mientras no hay una confirmacion abierta. */
  confirmacion: ConfirmacionAccionCambio | null
  onCargarNuevoCambio: () => void
  onCambiarPagina: (pagina: number) => void
  onReintentar: () => void
  onCerrarAviso: () => void
  onCerrarDetalle: () => void
  onReintentarDetalle: () => void
  /** Confirma Editar o Anular, segun confirmacion.accion. */
  onConfirmarAccionCambio: () => void
  onCancelarConfirmacion: () => void
  onSeleccionarMotivo: (codigoMotivo: string) => void
  onCambiarDetalleMotivo: (detalleMotivo: string) => void
}

/** Props de la busqueda de la venta a vincular. */
export interface PropiedadesBusquedaVenta {
  filtros: FiltrosBusquedaVenta
  opciones: OpcionesFiltros
  periodoRapidoActivo: PeriodoRapido | null
  estado: EstadoBusquedaVenta
  /** Venta cuyo detalle se esta trayendo despues de tocar "Vincular". */
  idVentaVinculando: number | null
  /** Error al traer la venta elegida (por ejemplo 404). null si no hubo. */
  errorVinculacion: ErrorAccionCambio | null
  onBuscarVenta: (cambios: Partial<FiltrosBusquedaVenta>) => void
  onSeleccionarPeriodoRapido: (periodo: PeriodoRapido) => void
  onBuscarProducto: (textoBusqueda: string) => void
  onSeleccionarProducto: (producto: ProductoFiltro | null) => void
  onLimpiarFiltros: () => void
  onCambiarPaginaBusqueda: (pagina: number) => void
  onReintentarBusqueda: () => void
  onVincularVenta: (idVenta: number) => void
}

/** Callbacks del alta de un cambio. */
export interface AccionesAltaCambio {
  /** Quita la venta vinculada y el articulo devuelto elegido de ella. */
  onDesvincularVenta: () => void
  /** Tras un 404: descarta la venta y vuelve a la busqueda. */
  onElegirOtraVenta: () => void
  onSeleccionarArticuloVenta: (idProducto: number) => void
  onBuscarProductoDevuelto: (textoBusqueda: string) => void
  onSeleccionarProductoDevuelto: (idProducto: number) => void
  onCambiarCantidadDevuelta: (cantidad: number | null) => void
  onCambiarBolsaAbierta: (esBolsaAbierta: boolean) => void
  onCambiarPesoDevuelto: (pesoKg: number | null) => void
  /** Quita el articulo devuelto elegido del catalogo, para volver a buscar. */
  onQuitarProductoDevuelto: () => void
  /** Quita el articulo entregado elegido, para volver a buscar. */
  onQuitarProductoEntregado: () => void
  onBuscarProductoEntregado: (textoBusqueda: string) => void
  onSeleccionarProductoEntregado: (idProducto: number) => void
  onCambiarCantidadEntregada: (cantidad: number | null) => void
  onSeleccionarMedioPago: (idMedioPago: number) => void
  onCambiarMontoRecibido: (monto: number | null) => void
  onSeleccionarMotivo: (codigoMotivo: string) => void
  onCambiarDetalleMotivo: (detalleMotivo: string) => void
  onSiguientePaso: () => void
  onPasoAnterior: () => void
  /** Confirma el alta (ya con resumen previo y saldo validado). */
  onConfirmarCambio: () => void
  /** Despues de un resultado incierto: vuelve a consultar la lista para saber si el cambio se guardo. */
  onVerificarEnvio: () => void
  onCargarOtroCambio: () => void
  onVerDetalleCambioCreado: () => void
  /** Si hay datos cargados pide confirmar el descarte; si no, cierra. */
  onSolicitarCierre: () => void
  onConfirmarDescarte: () => void
  onCancelarDescarte: () => void
}

/** Props del modal de alta de un cambio. */
export interface AltaCambioProps {
  abierto: boolean
  paso: PasoAltaCambio
  borrador: BorradorCambio
  busquedaVenta: PropiedadesBusquedaVenta
  textoBusquedaDevuelto: string
  textoBusquedaEntregado: string
  resultadosDevuelto: ProductoCatalogoCambio[]
  resultadosEntregado: ProductoCatalogoCambio[]
  /** Productos de igual o mayor valor que lo devuelto, para ofrecer sin que el vendedor deba buscarlos. */
  sugerenciasEntregado: ProductoCatalogoCambio[]
  mediosPago: MedioPago[]
  /** Carga del catalogo de productos y de los medios de pago: sin ellos no se puede cargar el cambio. */
  estadoCatalogo: EstadoCargaRecurso
  estadoMediosPago: EstadoCargaRecurso
  onReintentarCatalogo: () => void
  onReintentarMediosPago: () => void
  /** Lo que no se pudo repoblar al editar un cambio; vacio en un alta nueva. */
  avisosRepoblado: string[]
  resumenSaldo: ResumenSaldoCambio
  validacion: ValidacionCambio
  estadoEnvio: EstadoEnvioCambio
  confirmandoDescarte: boolean
  acciones: AccionesAltaCambio
}
