import type { CanalVenta, TipoEntrega } from '@/features/ventas/types/venta'

/** Un pago de la venta anulada, para volver a cargarlo en el cobro. */
export interface PagoBorradorRepoblado {
  idMedioPago: number
  /** Solo para avisar si el medio ya no esta disponible. */
  nombreMedioPago: string
  /** Parte del total que cubria este medio, antes de su ajuste, en pesos. */
  montoBase: number
  /** Solo efectivo con "Paga con" informado. */
  montoRecibido: number | null
}

/** Descuento manual de la venta anulada. */
export interface DescuentoBorradorRepoblado {
  /** En pesos: el back lo guarda como monto, aunque se haya escrito como porcentaje. */
  monto: number
  motivo: string
}

/**
 * Datos de una venta recien anulada por Editar, con los que se vuelve a abrir Registrar Venta
 * (SSOT CUB 1.2, paso 2). Viaja en el state del router. No incluye precios: se toman los vigentes.
 */
export interface BorradorRepoblado {
  canalVenta: CanalVenta
  tipoEntrega: TipoEntrega
  clienteReferencia: string | null
  /** El nombre es solo para avisar si el producto ya no esta disponible. */
  items: { idProducto: string; nombreProducto: string; cantidad: number }[]
  descuentoManual: DescuentoBorradorRepoblado | null
  /** Vacio si la venta era un fiado. */
  pagos: PagoBorradorRepoblado[]
}
