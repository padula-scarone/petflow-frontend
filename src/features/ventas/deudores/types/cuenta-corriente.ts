import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'

/** Lo que filtra la lista de Deudores. */
export interface FiltrosDeudores {
  /** Nombre o DNI, parcial y sin distinguir mayusculas. */
  busqueda: string
  /** Apagado (por defecto) la lista muestra solo a quienes deben algo. */
  incluirSinDeuda: boolean
}

/** Una fila de la lista de Deudores. Los importes estan en pesos. */
export interface FilaDeudor {
  idDeudor: number
  nombreCompleto: string
  dni: string
  cantidadFiadosPendientes: number
  saldo: number
  /** AAAA-MM-DD; null si ningun fiado pendiente tiene fecha estimada. */
  proximaFechaEstimadaPago: string | null
  /** Verdadero si la proxima fecha ya paso. La calcula el hook contra la fecha de hoy. */
  proximoPagoVencido: boolean
}

/** Estado de la lista de Deudores. */
export type EstadoListaDeudores =
  | { tipo: 'cargando' }
  | { tipo: 'error'; mensaje: string }
  /** No hay deudores y no hay filtros activos. */
  | { tipo: 'sin-deudores' }
  /** Hay deudores, pero la busqueda o el interruptor no devuelven ninguno. */
  | { tipo: 'sin-resultados' }
  | { tipo: 'con-deudores'; filas: FilaDeudor[]; paginacion: PaginacionResultados }

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
}

/**
 * Un fiado tal como lo conoce el Historial. Viaja en el estado del router al tocar "Ver deuda" para que la ficha
 * muestre ese mismo fiado: en la maqueta el almacen no lo conoce de antes. Con el back real la ficha lo pide al servidor.
 */
export interface FiadoOrigenHistorial {
  idVenta: number
  numeroComprobante: string
  /** Fecha y hora de la venta en formato ISO 8601. */
  fechaHora: string
  importeAdeudado: number
  montoPagado: number
  /** AAAA-MM-DD; null = sin fecha. */
  fechaEstimadaPago: string | null
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
  /** Verdadero mientras se piden resultados nuevos y la lista anterior sigue visible. */
  actualizando: boolean
  onCambiarBusqueda: (busqueda: string) => void
  onCambiarIncluirSinDeuda: (incluirSinDeuda: boolean) => void
  onCambiarPagina: (pagina: number) => void
  onAbrirFicha: (idDeudor: number) => void
  onNuevoDeudor: () => void
  onReintentar: () => void
}
