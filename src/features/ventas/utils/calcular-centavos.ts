import type { MedioPago } from '@/features/ventas/types/cobro'

// Todo el calculo de la venta se hace en centavos enteros, con las mismas formulas que el back
// (ventas.service.ts): asi la vista previa coincide al centavo con lo que el servidor va a calcular.

/** Convierte pesos (hasta 2 decimales) a centavos enteros. */
export function convertirPesosACentavos(pesos: number) {
  return Math.round(pesos * 100)
}

/** Convierte centavos enteros a pesos. */
export function convertirCentavosAPesos(centavos: number) {
  return centavos / 100
}

/** Subtotal de una linea: precio por cantidad, redondeado a centavos como lo hace el back (cantidad en milesimas). */
export function calcularSubtotalLineaCentavos(precioCentavos: number, cantidad: number) {
  const cantidadMilesimas = Math.round(cantidad * 1000)
  return Math.round((precioCentavos * cantidadMilesimas) / 1000)
}

/** Ajuste neto de un medio en puntos basicos (1000 = 10 %): positivo si recarga, negativo si descuenta. */
export function calcularAjusteBasisPoints(medio: MedioPago) {
  const puntosBasicos = Math.round(medio.porcentajeAjuste * 100)
  if (medio.tipoAjuste === 'recargo') return puntosBasicos
  if (medio.tipoAjuste === 'descuento') return -puntosBasicos
  return 0
}

/** Monto final de un pago: la porcion base mas el ajuste del medio, redondeado a centavos como lo hace el back. */
export function calcularMontoFinalCentavos(baseCentavos: number, ajusteBasisPoints: number) {
  return Math.round((baseCentavos * (10000 + ajusteBasisPoints)) / 10000)
}

/** Descuento manual en porcentaje, convertido a centavos sobre el subtotal. */
export function calcularDescuentoPorcentajeCentavos(subtotalCentavos: number, porcentaje: number) {
  return Math.round((subtotalCentavos * porcentaje) / 100)
}
