import type { Deudor } from '@/features/ventas/deudores/types/deudor'

// Almacen en memoria que hace de back en la maqueta. Los importes se guardan en centavos enteros.

/** Un pago aplicado a un fiado, en centavos. */
export interface PagoFiadoAlmacenado {
  /** Fecha y hora del pago en formato ISO 8601. */
  fechaHora: string
  /** Porcion base que se abono al fiado. */
  montoCentavos: number
  /** Recibo del cobro. El pago inicial de un fiado tambien lo tiene: el back lo registra como un cobro. */
  numeroRecibo: string
}

/** Un fiado guardado: lo adeudado y cada pago que recibio. */
export interface FiadoAlmacenado {
  idVenta: number
  numeroComprobante: string
  /** Fecha y hora de la venta en formato ISO 8601. */
  fechaHora: string
  /** AAAA-MM-DD; null = sin fecha. */
  fechaEstimadaPago: string | null
  importeAdeudadoCentavos: number
  /** El pago inicial (si lo hubo) y los cobros posteriores, del mas viejo al mas nuevo. */
  pagos: PagoFiadoAlmacenado[]
}

/** Un deudor con sus fiados, pendientes y completados. */
export interface DeudorAlmacenado {
  deudor: Deudor
  fiados: FiadoAlmacenado[]
}

/** Todo lo que recuerda el almacen. */
export interface EstadoAlmacenDeudores {
  deudores: DeudorAlmacenado[]
  proximoIdDeudor: number
  proximoIdVenta: number
  proximoIdCobro: number
}
