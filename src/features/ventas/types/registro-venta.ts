/** Estado con el que nace una venta, ya en los valores del front. */
export type EstadoVentaRegistrada = 'completada' | 'pendiente-pago'

/** Lo que devuelve el back al registrar una venta (201): alcanza para identificarla y pedir su detalle. */
export interface RegistroVenta {
  idVenta: string
  numeroComprobante: string
  montoTotal: number
  estado: EstadoVentaRegistrada
  /** Fecha y hora de la venta en formato ISO 8601. */
  fechaHora: string
}
