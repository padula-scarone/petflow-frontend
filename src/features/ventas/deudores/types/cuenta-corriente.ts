import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'

/**
 * Filtro por proximo pago (la fecha estimada mas cercana entre los fiados pendientes). HOY: vence hoy. ESTA_SEMANA:
 * vence entre hoy y el domingo. VENCIDOS: esa fecha ya paso. SIN_FECHA: ningun fiado pendiente tiene fecha.
 */
export type OpcionProximoPago = 'ESTA_SEMANA' | 'HOY' | 'VENCIDOS' | 'SIN_FECHA'

/** Por que dato se ordena la lista de Deudores. */
export type CriterioOrdenDeudores = 'NOMBRE' | 'FIADOS_PENDIENTES' | 'SALDO' | 'PROXIMO_PAGO' | 'FIADO_DESDE'

/** Hacia donde se ordena: ASCENDENTE es de menor a mayor (A-Z, mas cercano o mas viejo primero). */
export type SentidoOrden = 'ASCENDENTE' | 'DESCENDENTE'

/** Lo que filtra la lista de Deudores. */
export interface FiltrosDeudores {
  /**
   * Nombre o DNI, parcial y sin distinguir mayusculas. Sin busqueda la lista muestra solo a quienes deben algo; quien
   * no debe nada aparece unicamente al buscarlo.
   */
  busqueda: string
  /** null = todos los pagos. */
  proximoPago: OpcionProximoPago | null
  ordenarPor: CriterioOrdenDeudores
  sentido: SentidoOrden
}

/** Una fila de la lista de Deudores. Los importes estan en pesos. */
export interface FilaDeudor {
  idDeudor: number
  nombreCompleto: string
  // Sin telefono a proposito: la lista muestra a todos los deudores a la vez y el telefono solo se ve en la ficha
  dni: string
  cantidadFiadosPendientes: number
  saldo: number
  /** AAAA-MM-DD; null si ningun fiado pendiente tiene fecha estimada. */
  proximaFechaEstimadaPago: string | null
  /** Verdadero si la proxima fecha ya paso. La calcula el hook contra la fecha de hoy. */
  proximoPagoVencido: boolean
  /**
   * Fecha y hora (ISO 8601) de la venta del fiado pendiente mas antiguo, el mas viejo que todavia tiene saldo; null
   * si no tiene fiados pendientes. Se muestra como "Fecha de fiado".
   */
  fiadoDesde: string | null
}

/** La cuenta de un deudor tal como la entrega el estado de cuenta: sus datos, su saldo y sus fiados pendientes. */
export interface CuentaDeudor {
  deudor: Deudor
  saldo: number
  /** Del mas viejo al mas nuevo. */
  fiados: FiadoPendiente[]
}

/** Estado de la lista de Deudores. */
export type EstadoListaDeudores =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  /** No hay deudores y no hay filtros activos. */
  | { tipo: 'sin-deudores' }
  /** Hay deudores, pero la busqueda o los filtros no devuelven ninguno. */
  | { tipo: 'sin-resultados' }
  | { tipo: 'con-deudores'; filas: FilaDeudor[]; paginacion: PaginacionResultados }

/** Un pago que recibio un fiado. El monto esta en pesos. */
export interface PagoFiado {
  /** Cobro que lo registro: el pago inicial de un fiado tambien es un cobro. */
  idCobroDeudor: number
  /** Fecha y hora del pago en formato ISO 8601. */
  fechaHora: string
  /** Porcion base que se abono a ESTE fiado (no el total del cobro, que puede cubrir varios). */
  monto: number
  /** Numero del recibo del cobro (REC-...); null si el back no lo asigno todavia. */
  numeroRecibo: string | null
}

/** Un fiado pendiente de un deudor. Los importes estan en pesos. */
export interface FiadoPendiente {
  idVenta: number
  numeroComprobante: string
  /** Fecha y hora de la venta en formato ISO 8601. */
  fechaHora: string
  /** AAAA-MM-DD; null = "Sin fecha". */
  fechaEstimadaPago: string | null
  /** Verdadero si la fecha estimada ya paso. */
  fechaEstimadaVencida: boolean
  /** Lo que se adeudo al registrar la venta. */
  importeAdeudado: number
  /** Lo ya pagado: el pago inicial mas los cobros posteriores (porciones base). */
  montoPagado: number
  /** Lo que todavia falta: importe adeudado menos lo ya pagado. */
  montoFaltante: number
  /** Cada pago que recibio, del mas viejo al mas nuevo; vacio si todavia no pago nada. */
  pagos: PagoFiado[]
}

/** Estado de la ficha de un deudor. */
export type EstadoFichaDeudor =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  /** 404: el deudor no existe. */
  | { tipo: 'no-encontrado' }
  | { tipo: 'listo'; deudor: Deudor; saldo: number; fiados: FiadoPendiente[] }

/** Props de la lista de Deudores. */
export interface ListaDeudoresProps {
  filtros: FiltrosDeudores
  estadoLista: EstadoListaDeudores
  onCambiarBusqueda: (busqueda: string) => void
  onCambiarProximoPago: (proximoPago: OpcionProximoPago | null) => void
  onCambiarOrden: (criterio: CriterioOrdenDeudores) => void
  onInvertirSentido: () => void
  /** Quita la busqueda y el filtro por proximo pago; el orden se mantiene. */
  onLimpiarFiltros: () => void
  onCambiarPagina: (pagina: number) => void
  onAbrirFicha: (idDeudor: number) => void
  onReintentar: () => void
}
