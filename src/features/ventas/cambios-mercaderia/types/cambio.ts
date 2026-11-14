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
  VentaHistorial,
} from '@/features/ventas/types/historial'

// --- ENUMS DEL BACK ---

/** Estado de un cambio (enum EstadoCambio del back). ANULADO es baja logica (RF-GENERAL-01). */
export type EstadoCambio = 'ACTIVO' | 'ANULADO'

/** Acciones que exigen confirmacion y estan limitadas por la ventana de 15 minutos. */
export type AccionCambio = 'EDITAR' | 'ANULAR'

/** Filtro: el cambio tiene venta original o no. */
export type VinculoCambio = 'VINCULADO' | 'DESVINCULADO'

/** Motivos de un cambio. OTRO exige un detalle escrito. Lista a validar con el negocio. */
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
  /** En un articulo devuelto con bolsa abierta es el peso en kg (se reutiliza cantidadDevuelta). */
  cantidad: number
}

export interface ProductoDevueltoListado extends ProductoCambioListado {
  esBolsaAbierta: boolean
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
  /**
   * Pendiente de pedir al back. Hasta cuando se puede editar o anular, en ISO 8601:
   * 15 minutos desde la fecha y hora del cambio. null si esta anulado.
   */
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
  /** En un articulo devuelto con bolsa abierta es el peso en kg. */
  cantidad: number
  /** En un articulo devuelto con bolsa abierta es el precio por kg. */
  precioUnitario: number
  subtotal: number
}

export interface ArticuloDevueltoDetalle extends ArticuloCambioDetalle {
  esBolsaAbierta: boolean
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

/** Motivo con el que se cargo el cambio. */
export interface MotivoCambio {
  codigoMotivo: CodigoMotivoCambio
  /** Solo con OTRO. */
  detalleMotivo: string | null
}

/** Quien anulo el cambio, por que y cuando. Usuario y fecha y hora los asigna el servidor. */
export interface DatosAnulacionCambio {
  /** ANULAR, o EDITAR cuando es la anulacion interna de una edicion. */
  accion: AccionCambio
  codigoMotivo: CodigoMotivoAccionCambio
  /** Solo con OTRO. */
  detalleMotivo: string | null
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
  motivo: MotivoCambio
  vendedor: { idUsuario: number; nombre: string }
  /** null mientras el cambio este ACTIVO. */
  anulacion: DatosAnulacionCambio | null
}

/** Estado del panel de detalle. null (fuera de este tipo) significa panel cerrado. */
export type EstadoDetalleCambio =
  | { tipo: 'cargando'; idCambio: number }
  | { tipo: 'error'; idCambio: number; mensaje: string }
  | { tipo: 'listo'; cambio: CambioMercaderiaDetalle; fila: FilaCambio }

// --- ERRORES DEL SERVIDOR (SIMULADOS) ---

/** Identifica el caso del rechazo. El front lo pide al back: sin el habria que leer el texto del mensaje. */
export type CodigoErrorCambio =
  | 'DATOS_INVALIDOS'
  | 'SALDO_NEGATIVO'
  | 'PLAZO_VENCIDO'
  | 'VENTA_NO_ENCONTRADA'
  | 'CAMBIO_NO_ENCONTRADO'
  | 'SIN_CAJA_ABIERTA'
  | 'STOCK_INSUFICIENTE'
  | 'VENTA_NO_VINCULABLE'
  | 'CANTIDAD_EXCEDE_VENTA'
  | 'CAMBIO_YA_ANULADO'
  | 'STOCK_INSUFICIENTE_PARA_REVERTIR'

/** Rechazo del servidor a una accion sobre un cambio. */
export interface ErrorAccionCambio {
  /** 400: datos o regla invalidos. 403: ventana vencida. 404: no existe. 409: conflicto de estado, caja o stock. */
  estadoHttp: 400 | 403 | 404 | 409
  codigo: CodigoErrorCambio
  mensaje: string
}

// --- BODIES (SIMULADOS) ---

/** Body de POST /api/cambios-mercaderia. Precios, saldo, vuelto y stock ingresado los calcula el servidor. */
export interface RegistrarCambioBody {
  idVentaOriginal: number | null
  idProductoDevuelto: number
  /** Con esBolsaAbierta es el peso devuelto en kg: se reutiliza el campo. */
  cantidadDevuelta: number
  esBolsaAbierta: boolean
  idProductoEntregado: number
  cantidadEntregada: number
  /** Obligatorio solo si el saldo es mayor a 0. */
  idMedioPago: number | null
  /** Solo efectivo; el servidor calcula el vuelto. */
  montoRecibido: number | null
  codigoMotivo: CodigoMotivoCambio
  /** Solo con OTRO: de 1 a 200 caracteres sin contar espacios de los extremos. */
  detalleMotivo: string | null
}

/** Body de POST /api/cambios-mercaderia/:idCambio/anulacion, para ANULAR y para EDITAR. */
export interface AnularCambioBody {
  accion: AccionCambio
  codigoMotivo: CodigoMotivoAccionCambio
  detalleMotivo: string | null
}

export type ResultadoRegistrarCambio =
  | { tipo: 'exito'; cambio: CambioMercaderiaDetalle }
  | { tipo: 'error'; error: ErrorAccionCambio }

/** Funcion que simula el endpoint de alta de un cambio. */
export type RegistrarCambioServidor = (body: RegistrarCambioBody) => Promise<ResultadoRegistrarCambio>

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

/** Venta que aparece en la busqueda de vinculacion. Solo llegan COMPLETADA (config/reglas-cambios.ts). */
export interface VentaVinculable extends VentaHistorial {
  /** Pendiente de pedir al back: cuantos cambios ACTIVOS tiene ya esta venta. */
  cantidadCambiosActivos: number
}

/** Renglon de la venta vinculada, con lo ya devuelto por cambios ACTIVOS anteriores. */
export interface ItemVentaVinculable extends ItemVentaDetalle {
  /** En unidades (o kg si el renglon es GRANEL). Una bolsa abierta cuenta como 1 unidad. */
  cantidadYaDevuelta: number
  idProductoGranel: number | null
  nombreProductoGranel: string | null
  pesoNominalKg: number | null
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
  /** Con venta: precio pagado de la bolsa / peso nominal. Sin venta: precio actual de la bolsa / peso nominal. Nunca el precio suelto del granel. */
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
  /** Solo con bolsa abierta; precargado con el peso nominal. Viaja como cantidadDevuelta. */
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

/** Resultado de comparar lo que entra con lo que sale. */
export type SituacionSaldo = 'INCOMPLETO' | 'A_COBRAR' | 'SIN_DIFERENCIA' | 'NEGATIVO'

export interface ResumenSaldoCambio {
  valorDevuelto: number
  valorEntregado: number
  /** Valor entregado menos valor devuelto, redondeado a pesos enteros. */
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
  resumenSaldo: ResumenSaldoCambio
  validacion: ValidacionCambio
  estadoEnvio: EstadoEnvioCambio
  confirmandoDescarte: boolean
  acciones: AccionesAltaCambio
}
