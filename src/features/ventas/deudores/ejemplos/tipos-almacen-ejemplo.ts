import type { Deudor } from '@/features/ventas/deudores/types/deudor'

// Almacen en memoria que hace de back en la maqueta. Los importes se guardan en centavos enteros.

/** Un fiado guardado: lo adeudado y lo ya pagado, en centavos. */
export interface FiadoAlmacenado {
  idVenta: number
  numeroComprobante: string
  /** Fecha y hora de la venta en formato ISO 8601. */
  fechaHora: string
  /** AAAA-MM-DD; null = sin fecha. */
  fechaEstimadaPago: string | null
  importeAdeudadoCentavos: number
  /** Suma de las porciones base ya pagadas: el pago inicial mas los cobros posteriores. */
  montoPagadoCentavos: number
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
