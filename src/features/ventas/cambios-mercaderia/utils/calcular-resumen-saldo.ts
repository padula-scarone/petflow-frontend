import type {
  ArticuloDevueltoCargado,
  ArticuloEntregadoCargado,
  ResumenSaldoCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import {
  calcularCreditoBolsaAbiertaCentavos,
  calcularImporteCentavos,
  convertirCentavosAPesos,
  convertirPesosACentavos,
} from '@/features/ventas/utils/calcular-centavos'

// Todo el calculo se hace en centavos y con el mismo redondeo que el back (Decimal exacto, UNA vez a centavos,
// la mitad hacia arriba): si el front redondeara distinto, el back podria calcular otro saldo y rechazar el
// monto recibido.

const FACTOR_MILESIMAS = 1000

const convertirAMilesimas = (cantidad: number) => Math.round(cantidad * FACTOR_MILESIMAS)

/**
 * Credito de lo que el cliente devuelve, en centavos, o null si todavia falta un dato.
 * Bolsa cerrada o producto a granel: precio por cantidad. Bolsa abierta: precio de la BOLSA por la fraccion
 * devuelta (peso devuelto sobre peso de la bolsa), nunca el precio del granel.
 */
export function calcularCentavosDevueltos(articulo: ArticuloDevueltoCargado | null) {
  if (articulo === null) return null
  const precioCentavos = convertirPesosACentavos(articulo.precioUnitario)
  if (articulo.esBolsaAbierta) {
    if (articulo.opcionBolsaAbierta === null) return null
    if (articulo.pesoDevueltoKg === null || articulo.pesoDevueltoKg <= 0) return null
    return calcularCreditoBolsaAbiertaCentavos(
      precioCentavos,
      convertirAMilesimas(articulo.pesoDevueltoKg),
      articulo.opcionBolsaAbierta.pesoNominalMilesimas,
    )
  }
  if (articulo.cantidad === null || articulo.cantidad <= 0) return null
  return calcularImporteCentavos(precioCentavos, convertirAMilesimas(articulo.cantidad))
}

/** Valor de lo que el cliente se lleva, en centavos, o null si todavia falta un dato. */
export function calcularCentavosEntregados(articulo: ArticuloEntregadoCargado | null) {
  if (articulo === null) return null
  if (articulo.cantidad === null || articulo.cantidad <= 0) return null
  return calcularImporteCentavos(convertirPesosACentavos(articulo.precioUnitario), convertirAMilesimas(articulo.cantidad))
}

/** Valor de lo devuelto en pesos con centavos, o null si todavia falta un dato. */
export function calcularValorDevuelto(articulo: ArticuloDevueltoCargado | null) {
  const centavos = calcularCentavosDevueltos(articulo)
  return centavos === null ? null : convertirCentavosAPesos(centavos)
}

/** Valor de lo entregado en pesos con centavos, o null si todavia falta un dato. */
export function calcularValorEntregado(articulo: ArticuloEntregadoCargado | null) {
  const centavos = calcularCentavosEntregados(articulo)
  return centavos === null ? null : convertirCentavosAPesos(centavos)
}

/**
 * Compara lo que entra con lo que sale. Saldo = valor entregado menos valor devuelto, en centavos.
 * No existen reembolsos: un saldo negativo se informa como NEGATIVO y bloquea la confirmacion.
 * El vuelto solo existe en efectivo (admiteVuelto) con un monto recibido que cubra el saldo.
 */
export function calcularResumenSaldo(
  articuloDevuelto: ArticuloDevueltoCargado | null,
  articuloEntregado: ArticuloEntregadoCargado | null,
  montoRecibido: number | null,
  admiteVuelto: boolean,
): ResumenSaldoCambio {
  const centavosDevueltos = calcularCentavosDevueltos(articuloDevuelto)
  const centavosEntregados = calcularCentavosEntregados(articuloEntregado)

  if (centavosDevueltos === null || centavosEntregados === null) {
    return {
      valorDevuelto: convertirCentavosAPesos(centavosDevueltos ?? 0),
      valorEntregado: convertirCentavosAPesos(centavosEntregados ?? 0),
      saldo: 0,
      situacion: 'INCOMPLETO',
      vuelto: null,
    }
  }

  const saldoCentavos = centavosEntregados - centavosDevueltos
  const situacion = saldoCentavos < 0 ? 'NEGATIVO' : saldoCentavos === 0 ? 'SIN_DIFERENCIA' : 'A_COBRAR'
  const recibidoCentavos = montoRecibido === null ? null : convertirPesosACentavos(montoRecibido)
  const vueltoCentavos =
    situacion === 'A_COBRAR' && admiteVuelto && recibidoCentavos !== null && recibidoCentavos >= saldoCentavos
      ? recibidoCentavos - saldoCentavos
      : null

  return {
    valorDevuelto: convertirCentavosAPesos(centavosDevueltos),
    valorEntregado: convertirCentavosAPesos(centavosEntregados),
    saldo: convertirCentavosAPesos(saldoCentavos),
    situacion,
    vuelto: vueltoCentavos === null ? null : convertirCentavosAPesos(vueltoCentavos),
  }
}
