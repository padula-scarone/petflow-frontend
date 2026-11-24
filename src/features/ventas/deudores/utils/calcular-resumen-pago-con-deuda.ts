import type { ResumenPagoConDeuda } from '@/features/ventas/deudores/types/pago-con-deuda'
import { convertirCentavosAPesos } from '@/features/ventas/utils/calcular-centavos'

/** Lo que hace falta para calcular el resumen del paso de pago, todo en centavos enteros. */
interface EntradaResumenPagoCentavos {
  subtotalProductosCentavos: number
  montoDescuentoManualCentavos: number
  /** Suma de las porciones base que se pagan ahora (antes de los ajustes de los medios). */
  pagadoAhoraBaseCentavos: number
  /** Suma de los recargos (positivos) y descuentos (negativos) de los medios sobre lo que se paga ahora. */
  ajusteMediosPagoCentavos: number
}

/**
 * Resumen del paso de pago, en pesos. La deuda se calcula en base: el importe de la venta menos lo que se paga
 * ahora, sin ajustes. Los recargos y descuentos de los medios solo alcanzan a lo que se paga ahora; los de un cobro
 * posterior se calculan cuando ese cobro ocurre (RF-VENTAS-13).
 */
export function calcularResumenPagoConDeuda({
  subtotalProductosCentavos,
  montoDescuentoManualCentavos,
  pagadoAhoraBaseCentavos,
  ajusteMediosPagoCentavos,
}: EntradaResumenPagoCentavos): ResumenPagoConDeuda {
  const importeVentaCentavos = subtotalProductosCentavos - montoDescuentoManualCentavos
  return {
    subtotalProductos: convertirCentavosAPesos(subtotalProductosCentavos),
    montoDescuentoManual: convertirCentavosAPesos(montoDescuentoManualCentavos),
    importeVenta: convertirCentavosAPesos(importeVentaCentavos),
    pagadoAhoraBase: convertirCentavosAPesos(pagadoAhoraBaseCentavos),
    ajusteMediosPago: convertirCentavosAPesos(ajusteMediosPagoCentavos),
    cobradoAhora: convertirCentavosAPesos(pagadoAhoraBaseCentavos + ajusteMediosPagoCentavos),
    queDebe: convertirCentavosAPesos(Math.max(importeVentaCentavos - pagadoAhoraBaseCentavos, 0)),
    excedente: convertirCentavosAPesos(Math.max(pagadoAhoraBaseCentavos - importeVentaCentavos, 0)),
  }
}
