import type {
  ArticuloDevueltoCargado,
  ArticuloEntregadoCargado,
  ResumenSaldoCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'

/**
 * Valor de lo que el cliente devuelve, o null si todavia falta un dato.
 * Bolsa cerrada o producto a granel: cantidad por precio. Bolsa abierta: peso devuelto por precio por kg
 * (el peso real, porque la bolsa pudo haber perdido contenido).
 */
export function calcularValorDevuelto(articulo: ArticuloDevueltoCargado | null) {
  if (articulo === null) return null
  if (articulo.esBolsaAbierta) {
    if (articulo.opcionBolsaAbierta === null) return null
    if (articulo.pesoDevueltoKg === null || articulo.pesoDevueltoKg <= 0) return null
    return Math.round(articulo.pesoDevueltoKg * articulo.opcionBolsaAbierta.precioPorKg)
  }
  if (articulo.cantidad === null || articulo.cantidad <= 0) return null
  return Math.round(articulo.cantidad * articulo.precioUnitario)
}

/** Valor de lo que el cliente se lleva, o null si todavia falta un dato. */
export function calcularValorEntregado(articulo: ArticuloEntregadoCargado | null) {
  if (articulo === null) return null
  if (articulo.cantidad === null || articulo.cantidad <= 0) return null
  return Math.round(articulo.cantidad * articulo.precioUnitario)
}

/**
 * Compara lo que entra con lo que sale. Saldo = valor entregado menos valor devuelto, en pesos enteros.
 * No existen reembolsos: un saldo negativo se informa como NEGATIVO y bloquea la confirmacion.
 * El vuelto solo existe en efectivo (admiteVuelto) con un monto recibido que cubra el saldo.
 */
export function calcularResumenSaldo(
  articuloDevuelto: ArticuloDevueltoCargado | null,
  articuloEntregado: ArticuloEntregadoCargado | null,
  montoRecibido: number | null,
  admiteVuelto: boolean,
): ResumenSaldoCambio {
  const valorDevuelto = calcularValorDevuelto(articuloDevuelto)
  const valorEntregado = calcularValorEntregado(articuloEntregado)

  if (valorDevuelto === null || valorEntregado === null) {
    return {
      valorDevuelto: valorDevuelto ?? 0,
      valorEntregado: valorEntregado ?? 0,
      saldo: 0,
      situacion: 'INCOMPLETO',
      vuelto: null,
    }
  }

  const saldo = valorEntregado - valorDevuelto
  const situacion = saldo < 0 ? 'NEGATIVO' : saldo === 0 ? 'SIN_DIFERENCIA' : 'A_COBRAR'
  const vuelto =
    situacion === 'A_COBRAR' && admiteVuelto && montoRecibido !== null && montoRecibido >= saldo
      ? montoRecibido - saldo
      : null

  return { valorDevuelto, valorEntregado, saldo, situacion, vuelto }
}
