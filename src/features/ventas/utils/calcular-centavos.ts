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

// --- CAMBIOS: IMPORTES CON REDONDEO EXACTO ---
// El back calcula los cambios con Decimal exacto y redondea UNA vez a centavos, la mitad hacia arriba. Estas
// cuentas usan BigInt para el producto intermedio: con montos grandes un entero de JS dejaria de ser exacto.

/** Divide dos enteros positivos y redondea la mitad hacia arriba (ROUND_HALF_UP del back). */
function dividirRedondeandoMitadArriba(numerador: bigint, denominador: bigint) {
  return Number((2n * numerador + denominador) / (2n * denominador))
}

/** Importe de un renglon de un cambio: precio por cantidad (en milesimas), redondeado una vez a centavos. */
export function calcularImporteCentavos(precioCentavos: number, cantidadMilesimas: number) {
  return dividirRedondeandoMitadArriba(BigInt(precioCentavos) * BigInt(cantidadMilesimas), 1000n)
}

/**
 * Credito de una bolsa abierta: precio de la BOLSA por la fraccion devuelta (peso devuelto sobre peso unitario),
 * redondeado una vez a centavos. Nunca se usa el precio del granel.
 */
export function calcularCreditoBolsaAbiertaCentavos(
  precioBolsaCentavos: number,
  pesoDevueltoMilesimas: number,
  pesoUnitarioMilesimas: number,
) {
  return dividirRedondeandoMitadArriba(
    BigInt(precioBolsaCentavos) * BigInt(pesoDevueltoMilesimas),
    BigInt(pesoUnitarioMilesimas),
  )
}
