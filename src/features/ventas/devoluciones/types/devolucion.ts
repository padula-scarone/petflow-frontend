import type { CodigoErrorDevolucion } from '@/features/ventas/devoluciones/types/api-devoluciones'
import type { EstadoCargaRecurso } from '@/features/ventas/types/carga'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type { PaginacionResultados, RangoFechasFiltro } from '@/features/ventas/types/compartidos'
import type { FormatoArticulo } from '@/features/ventas/types/venta'
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

/** Estado de una devolución (enum EstadoDevolucion del back). ANULADO es baja logica (RF-GENERAL-01). */
export type EstadoDevolucion = 'ACTIVO' | 'ANULADO'

/** Acciones que exigen confirmacion y estan limitadas por la ventana de 15 minutos. */
export type AccionDevolucion = 'EDITAR' | 'ANULAR'

/** Filtro: la devolución tiene venta original o no. */
export type VinculoDevolucion = 'VINCULADO' | 'DESVINCULADO'

/**
 * Motivos de una devolución. OTRO exige un detalle escrito. Lista a validar con el negocio. Son solo opciones de
 * la pantalla: el back no guarda codigos, guarda el texto que se arma con construirTextoMotivo.
 */
export type CodigoMotivoDevolucion =
  | 'PRODUCTO_DEFECTUOSO'
  | 'NO_LE_GUSTO_A_LA_MASCOTA'
  | 'ERROR_EN_LA_ENTREGA'
  | 'MEDIDA_INCORRECTA'
  | 'OTRO'

/** Motivos para anular una devolución. */
export type CodigoMotivoAnulacionDevolucion =
  | 'DEVOLUCION_DUPLICADO'
  | 'ERROR_DE_CARGA'
  | 'CLIENTE_SE_ARREPINTIO'
  | 'DEVOLUCION_NO_CONCRETADA'
  | 'OTRO'

/** Motivos para editar una devolución (que internamente la anula y reabre el alta). */
export type CodigoMotivoEdicionDevolucion =
  | 'ARTICULO_DEVUELTO_INCORRECTO'
  | 'ARTICULO_ENTREGADO_INCORRECTO'
  | 'CANTIDAD_O_PESO_INCORRECTOS'
  | 'VENTA_VINCULADA_INCORRECTA'
  | 'MEDIO_DE_PAGO_INCORRECTO'
  | 'OTRO'

/** Cualquier motivo con el que se anula una devolución: el de anular o el de editar. */
export type CodigoMotivoAccionDevolucion = CodigoMotivoAnulacionDevolucion | CodigoMotivoEdicionDevolucion

// --- LISTA (GET /api/cambios-mercaderia) ---

/** Venta original de una devolución, tal como se muestra en la grilla. */
export interface VentaVinculadaResumen {
  idVenta: number
  numeroComprobante: string
}

/** Articulo de una devolución, resumido para la grilla. */
export interface ProductoDevolucionListado {
  idProducto: number
  nombreProducto: string
  formatoVenta: FormatoVenta
  /** Unidades, o kg si el formato es GRANEL. En un devuelto con bolsa abierta son bolsas enteras. */
  cantidad: number
}

export interface ProductoDevueltoListado extends ProductoDevolucionListado {
  esBolsaAbierta: boolean
  /** Kilos que entraron al granel; solo con bolsa abierta (entonces `cantidad` son bolsas enteras). */
  pesoDevueltoKg: number | null
}

/** Devolución tal como la devuelve la grilla. */
export interface DevolucionListado {
  idDevolucion: number
  /** ISO 8601. */
  fechaHora: string
  estado: EstadoDevolucion
  /** null = devolución desvinculada. */
  ventaVinculada: VentaVinculadaResumen | null
  productoDevuelto: ProductoDevueltoListado
  productoEntregado: ProductoDevolucionListado
  /** Mayor o igual a 0. Es lo que entra a la caja. */
  saldoResultante: number
  /** null cuando no hubo saldo que cobrar. */
  idMedioPago: number | null
  nombreMedioPago: string | null
  /** Hasta cuando se puede editar o anular, en ISO 8601; lo calcula el back. null si esta anulado. */
  fechaHoraLimiteModificacion: string | null
}

/** Fila lista para renderizar: el hook ya evaluo la ventana contra la hora del servidor. */
export interface FilaDevolucion extends DevolucionListado {
  /**
   * true mientras se puede editar o anular: esta ACTIVA y no paso la hora de
   * fechaHoraLimiteModificacion. Al vencer pasa a false sin que el usuario recargue.
   */
  ventanaVigente: boolean
}

// --- FILTROS DE LA LISTA ---

/** Filtros de la lista de devoluciones. Se combinan con AND. */
export interface FiltrosDevoluciones extends RangoFechasFiltro {
  /** Coincide con el producto devuelto o con el entregado. */
  productoSeleccionado: ProductoFiltro | null
  estado: EstadoDevolucion | null
  vinculo: VinculoDevolucion | null
  /** Medio de pago del saldo. Es uno solo: en una devolución no existe "Mixto". */
  medioPago: number | null
}

/** Los cinco estados de la lista; "sin-devoluciones" y "sin-resultados" son distintos a proposito. */
export type EstadoListaDevoluciones =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  /** No hay devoluciones y no hay filtros activos. */
  | { tipo: 'sin-devoluciones' }
  /** Hay devoluciones, pero los filtros activos no devuelven ninguna. */
  | { tipo: 'sin-resultados' }
  | { tipo: 'con-devoluciones'; filas: FilaDevolucion[]; paginacion: PaginacionResultados }

// --- DETALLE (GET /api/cambios-mercaderia/:idDevolucion) ---

/** Un articulo de la devolución con su precio y su subtotal. */
export interface ArticuloDevolucionDetalle {
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

export interface ArticuloDevueltoDetalle extends ArticuloDevolucionDetalle {
  esBolsaAbierta: boolean
  /** Kilos que entraron al granel; solo con bolsa abierta. */
  pesoDevueltoKg: number | null
  /** Producto que recibio el stock: el granel si fue bolsa abierta, el mismo producto si no. */
  idProductoStockIngresado: number
  nombreProductoStockIngresado: string
}

/** Como se cobro el saldo. */
export interface PagoSaldoDevolucion {
  idMedioPago: number
  nombreMedioPago: string
  /** Solo efectivo. */
  montoRecibido: number | null
  vuelto: number | null
}

/**
 * Quien anulo la devolución, por que y cuando. Usuario y fecha y hora los asigna el servidor. El back no guarda
 * codigos de motivo ni distingue una baja de una edicion: guarda el texto que armo el front.
 */
export interface DatosAnulacionDevolucion {
  /** Texto libre de 1 a 200 caracteres, tal como se guardo. */
  motivo: string
  idUsuario: number
  nombreUsuario: string
  /** ISO 8601. */
  fechaHora: string
}

/** Devolución completa. */
export interface DevolucionDetalle
  extends Pick<
    DevolucionListado,
    | 'idDevolucion'
    | 'fechaHora'
    | 'estado'
    | 'ventaVinculada'
    | 'saldoResultante'
    | 'fechaHoraLimiteModificacion'
  > {
  articuloDevuelto: ArticuloDevueltoDetalle
  articuloEntregado: ArticuloDevolucionDetalle
  valorDevuelto: number
  valorEntregado: number
  /** null si no hubo saldo. */
  pagoSaldo: PagoSaldoDevolucion | null
  /** Texto libre con el que se cargo la devolución; null en devoluciones anteriores a que se guardara. */
  motivoDevolucion: string | null
  vendedor: { idUsuario: number; nombre: string }
  /** null mientras la devolución este ACTIVA. */
  anulacion: DatosAnulacionDevolucion | null
}

/** Estado del panel de detalle. null (fuera de este tipo) significa panel cerrado. */
export type EstadoDetalleDevolucion =
  | { tipo: 'cargando'; idDevolucion: number }
  | { tipo: 'error'; idDevolucion: number; mensaje: string }
  | { tipo: 'listo'; devolucion: DevolucionDetalle; fila: FilaDevolucion }

// --- ERRORES DE UNA ACCION ---

/** Por que fallo una accion sobre una devolución (alta, anulacion o edicion). El texto es propio, nunca el del back. */
export interface ErrorAccionDevolucion {
  /**
   * 400: datos o regla invalidos. 403: ventana vencida (o sin permiso). 404: no existe. 409: conflicto de
   * estado, caja o stock. null: no hubo respuesta del servidor y no se pudo confirmar el resultado.
   */
  estadoHttp: 400 | 403 | 404 | 409 | null
  /** Caso del rechazo segun el back; null si el back no lo informa (permiso, sin respuesta). */
  codigo: CodigoErrorDevolucion | null
  /** Texto para la vista; nunca el mensaje tecnico del back. */
  mensaje: string
  /** true si no se sabe si la accion se aplico: no se reenvia a ciegas. */
  incierto: boolean
  /** false cuando repetir la accion no tiene sentido (la devolución no existe o ya lo resolvio otra persona). */
  reintentable: boolean
}

// --- CONFIRMACION DE EDITAR / ANULAR ---

/** Confirmacion abierta de editar o anular una devolución. */
export interface ConfirmacionAccionDevolucion {
  accion: AccionDevolucion
  fila: FilaDevolucion
  enviando: boolean
  error: ErrorAccionDevolucion | null
  /** null hasta que se elige uno: no hay opcion preseleccionada. */
  codigoMotivo: string | null
  /** Lo escrito en "Otro". Vacio con cualquier otro motivo. */
  detalleMotivo: string
  /** Hay motivo elegido y, si es OTRO, un detalle de 1 a 200 caracteres. */
  motivoValido: boolean
}

// --- ALTA: VENTA VINCULABLE ---

/**
 * Venta que aparece en la busqueda de vinculacion, con la cantidad de devoluciones ACTIVAS que ya tiene.
 * Solo llegan COMPLETADA (config/reglas-devoluciones.ts).
 */
export type VentaVinculable = VentaHistorialConsultada

/** Renglon de la venta vinculada, con lo ya devuelto por devoluciones ACTIVAS anteriores. */
export interface ItemVentaVinculable extends ItemVentaDetalle {
  /** En unidades (o kg si el renglon es GRANEL), de devoluciones ACTIVAS. Una bolsa abierta cuenta como 1 unidad. */
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
export interface ProductoCatalogoDevolucion {
  idProducto: number
  nombreProducto: string
  /** Nombre de la categoria, tal como lo manda el back. Es para mostrar en el buscador. */
  categoria: string
  formatoVenta: FormatoVenta
  /** El mismo dato que formatoVenta, con la forma que usa el catalogo de Registrar Venta: es lo que lee el buscador. */
  formato: FormatoArticulo
  precioUnitario: number
  stockDisponible: number
  urlImagen?: string
  /** null: el producto no tiene variante a granel. */
  opcionBolsaAbierta: OpcionBolsaAbierta | null
}

/** Articulo devuelto (entra) mientras se carga la devolución. */
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

/** Articulo entregado (sale) mientras se carga la devolución. */
export interface ArticuloEntregadoCargado {
  idProducto: number
  nombreProducto: string
  formatoVenta: FormatoVenta
  precioUnitario: number
  stockDisponible: number
  cantidad: number | null
}

/** Todo lo que el usuario fue cargando en el alta. */
export interface BorradorDevolucion {
  ventaVinculada: VentaVinculada | null
  articuloDevuelto: ArticuloDevueltoCargado | null
  articuloEntregado: ArticuloEntregadoCargado | null
  idMedioPago: number | null
  /** "Paga con": solo efectivo. */
  montoRecibido: number | null
  codigoMotivo: CodigoMotivoDevolucion | null
  /** Lo escrito en "Otro". Vacio con cualquier otro motivo. */
  detalleMotivo: string
}

/** Alta repoblada al editar una devolución, con lo que no se pudo repoblar. */
export interface AltaRepoblada {
  borrador: BorradorDevolucion
  /** Por ejemplo "La venta vinculada ya no se puede vincular": se repuebla el resto sin bloquear. */
  avisos: string[]
}

/** Resultado de comparar lo que entra con lo que sale. */
export type SituacionSaldo = 'INCOMPLETO' | 'A_COBRAR' | 'SIN_DIFERENCIA' | 'NEGATIVO'

export interface ResumenSaldoDevolucion {
  valorDevuelto: number
  valorEntregado: number
  /** Valor entregado menos valor devuelto, calculado en centavos como el back. */
  saldo: number
  situacion: SituacionSaldo
  /** Solo en efectivo con monto recibido suficiente. */
  vuelto: number | null
}

export type PasoAltaDevolucion = 'MOTIVO' | 'VENTA_ORIGINAL' | 'ARTICULOS' | 'COBRO'

/** Que se puede hacer con lo cargado hasta ahora y por que no. */
export interface ValidacionDevolucion {
  /** true si el paso esta completo y se puede salir de el. En COBRO equivale a poder confirmar. */
  puedeAvanzar: Record<PasoAltaDevolucion, boolean>
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

export type EstadoEnvioDevolucion =
  | { tipo: 'inactivo' }
  | { tipo: 'enviando' }
  | { tipo: 'error'; error: ErrorAccionDevolucion }
  /**
   * No se sabe si la devolución se guardo (sin red, tiempo agotado, 5xx o respuesta ilegible). No se reenvia:
   * se puede volver a verificar o revisar la lista.
   */
  | { tipo: 'incierto'; mensaje: string; verificando: boolean }
  | { tipo: 'exito'; devolucion: DevolucionDetalle }

// --- PROPS ---

/** Props del panel de filtros de la lista de devoluciones. */
export interface PropiedadesFiltrosDevoluciones {
  filtros: FiltrosDevoluciones
  opciones: OpcionesFiltros
  /** Todos los filtros con valor, incluido el producto. */
  cantidadFiltrosActivos: number
  /** Cuantos de los filtros de "Mas filtros" (vinculo y medio de pago) estan activos. */
  cantidadFiltrosAdicionales: number
  /** Cuantos de los filtros de la hoja de mobile estan activos: todos menos el producto, que esta a la vista. */
  cantidadFiltrosEnHoja: number
  periodoRapidoActivo: PeriodoRapido | null
  /** Total de la ultima consulta, para el boton "Ver n devoluciones" de la hoja mobile. */
  totalResultados: number | null
  onCambiarFiltros: (cambios: Partial<FiltrosDevoluciones>) => void
  onSeleccionarPeriodoRapido: (periodo: PeriodoRapido) => void
  onBuscarProducto: (textoBusqueda: string) => void
  onSeleccionarProducto: (producto: ProductoFiltro | null) => void
  onLimpiarFiltros: () => void
}

/** Callbacks de las acciones sobre una devolución. */
export interface PropiedadesAccionesDevolucion {
  onVerDetalleDevolucion: (idDevolucion: number) => void
  /** Abre la confirmacion con motivo; no ejecuta nada todavia. */
  onEditarDevolucion: (idDevolucion: number) => void
  /** Abre la confirmacion con motivo; no ejecuta nada todavia. */
  onAnularDevolucion: (idDevolucion: number) => void
}

/** Mensaje de exito que se muestra sobre la lista. */
export interface AvisoDevoluciones {
  mensaje: string
}

/** Props del componente presentacional de la seccion Devoluciones. */
export interface DevolucionesProps {
  estadoLista: EstadoListaDevoluciones
  propiedadesFiltros: PropiedadesFiltrosDevoluciones
  acciones: PropiedadesAccionesDevolucion
  aviso: AvisoDevoluciones | null
  /** null mientras el panel de detalle esta cerrado. */
  detalle: EstadoDetalleDevolucion | null
  /** null mientras no hay una confirmacion abierta. */
  confirmacion: ConfirmacionAccionDevolucion | null
  onCargarNuevaDevolucion: () => void
  onCambiarPagina: (pagina: number) => void
  onReintentar: () => void
  onCerrarAviso: () => void
  onCerrarDetalle: () => void
  onReintentarDetalle: () => void
  /** Confirma Editar o Anular, segun confirmacion.accion. */
  onConfirmarAccionDevolucion: () => void
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
  errorVinculacion: ErrorAccionDevolucion | null
  onBuscarVenta: (cambios: Partial<FiltrosBusquedaVenta>) => void
  onSeleccionarPeriodoRapido: (periodo: PeriodoRapido) => void
  onBuscarProducto: (textoBusqueda: string) => void
  onSeleccionarProducto: (producto: ProductoFiltro | null) => void
  onLimpiarFiltros: () => void
  onCambiarPaginaBusqueda: (pagina: number) => void
  onReintentarBusqueda: () => void
  onVincularVenta: (idVenta: number) => void
}

/** Callbacks del alta de una devolución. */
export interface AccionesAltaDevolucion {
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
  onConfirmarDevolucion: () => void
  /** Despues de un resultado incierto: vuelve a consultar la lista para saber si la devolución se guardo. */
  onVerificarEnvio: () => void
  onCargarOtraDevolucion: () => void
  onVerDetalleDevolucionCreada: () => void
  /** Si hay datos cargados pide confirmar el descarte; si no, cierra. */
  onSolicitarCierre: () => void
  onConfirmarDescarte: () => void
  onCancelarDescarte: () => void
}

/** Props del modal de alta de una devolución. */
export interface AltaDevolucionProps {
  abierto: boolean
  paso: PasoAltaDevolucion
  borrador: BorradorDevolucion
  busquedaVenta: PropiedadesBusquedaVenta
  textoBusquedaDevuelto: string
  textoBusquedaEntregado: string
  resultadosDevuelto: ProductoCatalogoDevolucion[]
  resultadosEntregado: ProductoCatalogoDevolucion[]
  /** Productos de igual o mayor valor que lo devuelto, para ofrecer sin que el vendedor deba buscarlos. */
  sugerenciasEntregado: ProductoCatalogoDevolucion[]
  mediosPago: MedioPago[]
  /** Carga del catalogo de productos y de los medios de pago: sin ellos no se puede cargar la devolución. */
  estadoCatalogo: EstadoCargaRecurso
  estadoMediosPago: EstadoCargaRecurso
  onReintentarCatalogo: () => void
  onReintentarMediosPago: () => void
  /** Lo que no se pudo repoblar al editar una devolución; vacio en un alta nueva. */
  avisosRepoblado: string[]
  resumenSaldo: ResumenSaldoDevolucion
  validacion: ValidacionDevolucion
  estadoEnvio: EstadoEnvioDevolucion
  confirmandoDescarte: boolean
  acciones: AccionesAltaDevolucion
}
