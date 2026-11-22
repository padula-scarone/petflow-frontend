import type { MedioPago } from '@/features/ventas/types/cobro'
import type { PagoComprobante } from '@/features/ventas/types/comprobante'
import {
  calcularAjusteBasisPoints,
  calcularMontoFinalCentavos,
  convertirCentavosAPesos,
} from '@/features/ventas/utils/calcular-centavos'

/** Un pago hecho ahora, tal como lo eligio el vendedor. */
export interface PagoAhora {
  idMedioPago: number
  /** Porcion del importe de la venta que cubre este medio, antes de su ajuste. */
  montoBaseCentavos: number
  /** Con cuanto pago el cliente; solo existe en efectivo. */
  montoRecibidoCentavos: number | null
}

/** Arma el pago del comprobante de un medio, con su ajuste. */
function armarPagoComprobante(pago: PagoAhora, medio: MedioPago): PagoComprobante {
  const ajusteBasisPoints = calcularAjusteBasisPoints(medio)
  const montoFinalCentavos = calcularMontoFinalCentavos(pago.montoBaseCentavos, ajusteBasisPoints)
  const base = {
    idMedioPago: medio.idMedioPago,
    nombreMedioPago: medio.nombre,
    montoBase: convertirCentavosAPesos(pago.montoBaseCentavos),
    // El comprobante guarda el porcentaje con signo: negativo es descuento
    porcentajeAjuste: ajusteBasisPoints / 100,
    montoAjuste: convertirCentavosAPesos(montoFinalCentavos - pago.montoBaseCentavos),
    montoFinal: convertirCentavosAPesos(montoFinalCentavos),
  }
  if (!medio.admiteVuelto) return { ...base, admiteVuelto: false }

  const recibido = pago.montoRecibidoCentavos
  return {
    ...base,
    admiteVuelto: true,
    montoRecibido: recibido === null ? null : convertirCentavosAPesos(recibido),
    vuelto: recibido === null ? null : convertirCentavosAPesos(Math.max(recibido - montoFinalCentavos, 0)),
  }
}

/** Convierte lo pagado ahora en los pagos del comprobante. Un medio que ya no existe se omite. */
export function armarPagosComprobanteConDeuda(pagos: PagoAhora[], medios: MedioPago[]): PagoComprobante[] {
  return pagos.flatMap((pago) => {
    const medio = medios.find((candidato) => candidato.idMedioPago === pago.idMedioPago)
    return medio === undefined ? [] : [armarPagoComprobante(pago, medio)]
  })
}
