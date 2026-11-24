import type { ComprobanteConDeuda } from '@/features/ventas/deudores/types/comprobante-con-deuda'
import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import type { ResumenPagoConDeuda } from '@/features/ventas/deudores/types/pago-con-deuda'
import type { PagoComprobante } from '@/features/ventas/types/comprobante'
import type { ArticuloCarrito, CanalVenta, TipoEntrega } from '@/features/ventas/types/venta'

/** Los datos de la venta simulada con los que se arma el comprobante. */
interface DatosComprobanteConDeuda {
  idVenta: number
  numeroComprobante: string
  fechaHora: string
  canalVenta: CanalVenta
  tipoEntrega: TipoEntrega
  nombreVendedor: string
  articulos: ArticuloCarrito[]
  /** null si la venta no tuvo descuento manual. */
  descuentoManual: { motivo: string; monto: number } | null
  resumen: ResumenPagoConDeuda
  pagos: PagoComprobante[]
  /** Recibo del pago inicial; null si no se pago nada ahora. */
  numeroReciboPagoInicial: string | null
  deudor: Deudor
  fechaEstimadaPago: string | null
}

/** Arma el comprobante de una venta con deuda. Es deuda total si no se pago nada ahora, y parcial si se pago una parte. */
export function armarComprobanteConDeuda({
  articulos,
  resumen,
  ...datos
}: DatosComprobanteConDeuda): ComprobanteConDeuda {
  return {
    ...datos,
    detalles: articulos.map((articulo) => ({
      idProducto: articulo.idProducto,
      nombreProducto: articulo.nombreProducto,
      formato: articulo.formato,
      cantidad: articulo.cantidad,
      precioUnitario: articulo.precioUnitario,
      subtotal: articulo.montoTotal,
    })),
    tipoDeuda: resumen.pagadoAhoraBase === 0 ? 'TOTAL' : 'PARCIAL',
    importeVenta: resumen.importeVenta,
    montoPagadoAhora: resumen.cobradoAhora,
    montoAdeudado: resumen.queDebe,
  }
}
