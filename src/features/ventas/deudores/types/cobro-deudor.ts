import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import type { FiadoPendiente } from '@/features/ventas/deudores/types/cuenta-corriente'
import type { PagoComprobante } from '@/features/ventas/types/comprobante'

/** Un fiado en la tabla de cobro, con lo que el vendedor tildo y tipeo. */
export interface FilaFiadoSeleccionable {
  fiado: FiadoPendiente
  seleccionado: boolean
  /** Pesos a cobrar de este fiado; null = campo vacio. Por defecto, lo que falta. */
  montoACobrar: number | null
  /** "Ingresá un monto mayor a cero" o "No puede superar lo que falta"; null si el monto es valido. */
  errorMonto: string | null
  /** Verdadero para el fiado que llego desde "Ver deuda" del Historial. */
  resaltado: boolean
}

/** Lo que resume la seleccion de fiados. */
export interface ResumenSeleccionFiados {
  cantidadSeleccionados: number
  totalACobrar: number
  todosSeleccionados: boolean
  hayErrores: boolean
  /** Hay al menos uno tildado, todos con monto valido. */
  puedeCobrar: boolean
}

/** Por que el back rechazo el cobro con 409. Es todo o nada: si falla uno, no se cobra ninguno. */
export type MotivoRechazoCobro =
  | 'FIADO_NO_PENDIENTE'
  | 'MONTO_SUPERA_FALTANTE'
  | 'CAJA_CERRADA'
  | 'DESCONOCIDO'

/** Rechazo del cobro. */
export interface ErrorCobroDeudor {
  estadoHttp: 400 | 404 | 409 | null
  motivo: MotivoRechazoCobro
  mensaje: string
  /** Falso si hay que refrescar la cuenta porque un fiado cambio. */
  reintentable: boolean
}

/** Un fiado dentro del recibo consolidado. */
export interface FiadoAbonado {
  idVenta: number
  numeroComprobante: string
  montoAbonado: number
  montoFaltanteResultante: number
  estadoResultante: 'PENDIENTE_PAGO' | 'COMPLETADA'
}

/** Recibo consolidado de un cobro; tiene numeracion propia, distinta de la de los comprobantes de venta. */
export interface ReciboCobroDeudor {
  idCobro: number
  numeroRecibo: string
  /** Fecha y hora del cobro en formato ISO 8601. */
  fechaHora: string
  deudor: Deudor
  nombreVendedor: string
  fiadosAbonados: FiadoAbonado[]
  pagos: PagoComprobante[]
  /** Lo que se abona a los fiados: suma de las porciones base. */
  montoAbonado: number
  /** Lo efectivamente cobrado, con los ajustes de los medios. */
  montoTotalCobrado: number
  vuelto: number | null
  saldoRestanteDeudor: number
  enlaceWhatsApp: string
  enlaceMail: string
}

/** Estado del cobro de fiados desde la ficha. */
export type EstadoCobroDeudor =
  | { fase: 'cerrado' }
  | { fase: 'cobrando' }
  | { fase: 'enviando' }
  | { fase: 'rechazado'; error: ErrorCobroDeudor }
  | { fase: 'cobrado'; recibo: ReciboCobroDeudor }
