import { esObjeto } from '@/lib/es-objeto'
import { convertirTextoACentavos } from '@/features/ventas/api/conversores-numericos'
import { NUMERO_COMPROBANTE_AUSENTE } from '@/features/ventas/config/reglas-venta'
import type {
  DeudorApi,
  EstadoCuentaResponse,
  FilaCuentaCorrienteApi,
  FiadoDeEstadoCuentaApi,
  PagoDeFiadoApi,
  PaginacionApi,
} from '@/features/ventas/deudores/types/api-deudores'
import type { FilaDeudor, FiadoPendiente, PagoFiado } from '@/features/ventas/deudores/types/cuenta-corriente'
import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import { esFechaPasada } from '@/features/ventas/deudores/utils/fechas-estimadas'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'
import { convertirCentavosAPesos } from '@/features/ventas/utils/calcular-centavos'

// Validan la forma de cada respuesta del back y la pasan a los tipos del front. Un 2xx que no cumple el contrato se
// trata como respuesta inutilizable (la capa api lo devuelve como fallo incierto), nunca como "no se guardo".

const esEnteroNoNegativo = (valor: unknown) =>
  typeof valor === 'number' && Number.isInteger(valor) && valor >= 0

const esTextoONulo = (valor: unknown) => valor === null || typeof valor === 'string'

// --- DEUDOR ---

/** Verdadero si el valor tiene la forma de un deudor del back. */
export function esDeudorApi(valor: unknown): valor is DeudorApi {
  return (
    esObjeto(valor) &&
    typeof valor.idDeudor === 'number' &&
    typeof valor.nombreCompleto === 'string' &&
    typeof valor.telefono === 'string' &&
    typeof valor.dni === 'string'
  )
}

/** El deudor del back y el del front tienen la misma forma. */
export function convertirDeudorApi(deudor: DeudorApi): Deudor {
  return {
    idDeudor: deudor.idDeudor,
    nombreCompleto: deudor.nombreCompleto,
    telefono: deudor.telefono,
    dni: deudor.dni,
  }
}

// --- PAGINACION ---

/** Verdadero si el valor tiene los cuatro metadatos de paginacion. */
export function esPaginacionApi(valor: unknown): valor is PaginacionApi {
  return (
    esObjeto(valor) &&
    esEnteroNoNegativo(valor.pagina) &&
    esEnteroNoNegativo(valor.cantidadPorPagina) &&
    esEnteroNoNegativo(valor.totalRegistros) &&
    esEnteroNoNegativo(valor.totalPaginas)
  )
}

/** Misma forma en el back y en el front. */
export function convertirPaginacionApi(paginacion: PaginacionApi): PaginacionResultados {
  return { ...paginacion }
}

// --- LISTA DE DEUDORES ---

/** Verdadero si el valor tiene la forma de una fila de la lista de cuentas corrientes. */
export function esFilaCuentaCorrienteApi(valor: unknown): valor is FilaCuentaCorrienteApi {
  return (
    esObjeto(valor) &&
    typeof valor.idDeudor === 'number' &&
    typeof valor.nombreCompleto === 'string' &&
    typeof valor.dni === 'string' &&
    typeof valor.saldo === 'string' &&
    esEnteroNoNegativo(valor.cantidadFiadosPendientes) &&
    esTextoONulo(valor.fiadoDesde) &&
    esTextoONulo(valor.proximaFechaEstimadaPago)
  )
}

/**
 * Pasa una fila de la lista al front; null si el saldo no es un monto valido. "Vencido" se calcula contra `hoy`
 * (la fecha de Argentina): el listado solo trae la fecha, no si ya paso.
 */
export function convertirFilaCuentaCorrienteApi(fila: FilaCuentaCorrienteApi, hoy: string): FilaDeudor | null {
  const saldoCentavos = convertirTextoACentavos(fila.saldo)
  if (saldoCentavos === null) return null
  return {
    idDeudor: fila.idDeudor,
    nombreCompleto: fila.nombreCompleto,
    dni: fila.dni,
    cantidadFiadosPendientes: fila.cantidadFiadosPendientes,
    saldo: convertirCentavosAPesos(saldoCentavos),
    proximaFechaEstimadaPago: fila.proximaFechaEstimadaPago,
    proximoPagoVencido: fila.proximaFechaEstimadaPago !== null && esFechaPasada(fila.proximaFechaEstimadaPago, hoy),
    fiadoDesde: fila.fiadoDesde,
  }
}

// --- ESTADO DE CUENTA ---

function esPagoDeFiadoApi(valor: unknown): valor is PagoDeFiadoApi {
  return (
    esObjeto(valor) &&
    typeof valor.idCobroDeudor === 'number' &&
    esTextoONulo(valor.numeroRecibo) &&
    typeof valor.fechaHora === 'string' &&
    typeof valor.monto === 'string'
  )
}

function esFiadoDeEstadoCuentaApi(valor: unknown): valor is FiadoDeEstadoCuentaApi {
  return (
    esObjeto(valor) &&
    typeof valor.idVenta === 'number' &&
    esTextoONulo(valor.numeroComprobante) &&
    typeof valor.fechaHora === 'string' &&
    esTextoONulo(valor.fechaEstimadaPago) &&
    typeof valor.vencido === 'boolean' &&
    typeof valor.importeAdeudado === 'string' &&
    typeof valor.yaPagado === 'string' &&
    typeof valor.falta === 'string' &&
    Array.isArray(valor.pagos) &&
    valor.pagos.every(esPagoDeFiadoApi)
  )
}

/** Verdadero si el valor tiene la forma del estado de cuenta de un deudor. */
export function esEstadoCuentaResponse(valor: unknown): valor is EstadoCuentaResponse {
  return (
    esObjeto(valor) &&
    esDeudorApi(valor.deudor) &&
    typeof valor.saldo === 'string' &&
    Array.isArray(valor.fiados) &&
    valor.fiados.every(esFiadoDeEstadoCuentaApi)
  )
}

function convertirPagoDeFiadoApi(pago: PagoDeFiadoApi): PagoFiado | null {
  const montoCentavos = convertirTextoACentavos(pago.monto)
  if (montoCentavos === null) return null
  return {
    idCobroDeudor: pago.idCobroDeudor,
    fechaHora: pago.fechaHora,
    monto: convertirCentavosAPesos(montoCentavos),
    numeroRecibo: pago.numeroRecibo,
  }
}

/** Pasa un fiado del estado de cuenta al front; null si algun monto no es valido. */
export function convertirFiadoDeEstadoCuentaApi(fiado: FiadoDeEstadoCuentaApi): FiadoPendiente | null {
  const importeAdeudadoCentavos = convertirTextoACentavos(fiado.importeAdeudado)
  const montoPagadoCentavos = convertirTextoACentavos(fiado.yaPagado)
  const montoFaltanteCentavos = convertirTextoACentavos(fiado.falta)
  if (importeAdeudadoCentavos === null || montoPagadoCentavos === null || montoFaltanteCentavos === null) return null

  const pagos = fiado.pagos.map(convertirPagoDeFiadoApi)
  if (pagos.some((pago) => pago === null)) return null

  return {
    idVenta: fiado.idVenta,
    numeroComprobante: fiado.numeroComprobante ?? NUMERO_COMPROBANTE_AUSENTE,
    fechaHora: fiado.fechaHora,
    fechaEstimadaPago: fiado.fechaEstimadaPago,
    fechaEstimadaVencida: fiado.vencido,
    importeAdeudado: convertirCentavosAPesos(importeAdeudadoCentavos),
    montoPagado: convertirCentavosAPesos(montoPagadoCentavos),
    montoFaltante: convertirCentavosAPesos(montoFaltanteCentavos),
    pagos: pagos.filter((pago): pago is PagoFiado => pago !== null),
  }
}
