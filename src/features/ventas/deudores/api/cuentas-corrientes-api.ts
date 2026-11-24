import { esObjeto } from '@/lib/es-objeto'
import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import { crearFalloRespuestaInvalida } from '@/features/ventas/api/crear-fallo-respuesta-invalida'
import { descartarSiHayNulos } from '@/features/ventas/api/descartar-si-hay-nulos'
import { convertirTextoACentavos } from '@/features/ventas/api/conversores-numericos'
import { convertirConsultaAParametros } from '@/features/ventas/api/consultar-historial-api'
import { convertirPagoApiAComprobante } from '@/features/ventas/api/convertir-detalle-api-a-comprobante'
import { NUMERO_COMPROBANTE_AUSENTE } from '@/features/ventas/config/reglas-venta'
import {
  convertirDeudorApi,
  convertirFilaCuentaCorrienteApi,
  convertirFiadoDeEstadoCuentaApi,
  convertirPaginacionApi,
  esDeudorApi,
  esEstadoCuentaResponse,
  esFilaCuentaCorrienteApi,
  esPaginacionApi,
} from '@/features/ventas/deudores/api/conversores-deudores'
import type {
  ConsultaCuentasCorrientesApi,
  ConsultarCobroResponse,
  FiadoCobradoApi,
  OrdenarPorApi,
  PagoDeCobroApi,
  ProximoPagoApi,
  RegistrarCobroRequest,
  RegistrarCobroResponse,
} from '@/features/ventas/deudores/types/api-deudores'
import type {
  CobroConsultado,
  CobroDeudorRegistrado,
  FiadoAbonado,
} from '@/features/ventas/deudores/types/cobro-deudor'
import type {
  CriterioOrdenDeudores,
  CuentaDeudor,
  FilaDeudor,
  FiltrosDeudores,
  OpcionProximoPago,
} from '@/features/ventas/deudores/types/cuenta-corriente'
import { obtenerFechaHoy } from '@/features/ventas/deudores/utils/fechas-estimadas'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type { PagoComprobante } from '@/features/ventas/types/comprobante'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'
import { convertirCentavosAPesos } from '@/features/ventas/utils/calcular-centavos'

const RUTA_CUENTAS_CORRIENTES_API = '/api/cuentas-corrientes'
/** Largo maximo del texto de busqueda que acepta el back. */
const TEXTO_BUSQUEDA_LONGITUD_MAXIMA = 100

/** Una pagina de la lista de Deudores ya traducida. */
export interface PaginaDeudoresConsultada {
  deudores: FilaDeudor[]
  paginacion: PaginacionResultados
}

// --- LISTA: REQUEST ---

const ORDENAR_POR_API: Record<CriterioOrdenDeudores, OrdenarPorApi> = {
  NOMBRE: 'nombre',
  FIADOS_PENDIENTES: 'fiadosPendientes',
  SALDO: 'saldo',
  FIADO_DESDE: 'fechaFiado',
  PROXIMO_PAGO: 'proximoPago',
}

const PROXIMO_PAGO_API: Record<OpcionProximoPago, ProximoPagoApi> = {
  HOY: 'hoy',
  ESTA_SEMANA: 'estaSemana',
  VENCIDOS: 'vencidos',
  SIN_FECHA: 'sinFecha',
}

/**
 * Pasa los filtros de la pantalla a la query del back: omite lo vacio y recorta el texto. "Sin busqueda solo se ven
 * los que deben, y quien no debe aparece al buscarlo" se traduce a `incluirSinDeuda` solo cuando hay texto. El orden
 * siempre va completo (criterio y sentido): el back rechaza un sentido sin criterio.
 */
export function convertirFiltrosAConsultaCuentasCorrientes(
  filtros: FiltrosDeudores,
  pagina: number,
  cantidadPorPagina: number,
): ConsultaCuentasCorrientesApi {
  const texto = filtros.busqueda.trim().slice(0, TEXTO_BUSQUEDA_LONGITUD_MAXIMA)
  return {
    pagina,
    cantidadPorPagina,
    ...(texto !== '' && { texto, incluirSinDeuda: 'true' as const }),
    ...(filtros.proximoPago !== null && { proximoPago: PROXIMO_PAGO_API[filtros.proximoPago] }),
    ordenarPor: ORDENAR_POR_API[filtros.ordenarPor],
    sentido: filtros.sentido === 'ASCENDENTE' ? 'asc' : 'desc',
  }
}

/** GET /api/cuentas-corrientes: una pagina de deudores con su saldo. Una pagina fuera de rango llega vacia. */
export async function consultarCuentasCorrientesApi(
  cliente: ClienteHttp,
  filtros: FiltrosDeudores,
  pagina: number,
  cantidadPorPagina: number,
): Promise<ResultadoApi<PaginaDeudoresConsultada>> {
  const resultado = await cliente.solicitar<unknown>(RUTA_CUENTAS_CORRIENTES_API, {
    parametros: convertirConsultaAParametros(
      convertirFiltrosAConsultaCuentasCorrientes(filtros, pagina, cantidadPorPagina),
    ),
  })
  if (!resultado.exitoso) return resultado

  const { datos } = resultado
  if (!esObjeto(datos) || !Array.isArray(datos.cuentasCorrientes) || !esPaginacionApi(datos.paginacion)) {
    return crearFalloRespuestaInvalida(200)
  }
  const filasApi = datos.cuentasCorrientes.filter(esFilaCuentaCorrienteApi)
  if (filasApi.length !== datos.cuentasCorrientes.length) return crearFalloRespuestaInvalida(200)

  // "Hoy" es el de Argentina, no el del dispositivo: de ahi sale si un proximo pago esta vencido
  const hoy = obtenerFechaHoy()
  const deudores = descartarSiHayNulos(filasApi.map((fila) => convertirFilaCuentaCorrienteApi(fila, hoy)))
  if (deudores === null) return crearFalloRespuestaInvalida(200)
  return { exitoso: true, datos: { deudores, paginacion: convertirPaginacionApi(datos.paginacion) } }
}

// --- FICHA ---

/** GET /api/cuentas-corrientes/:idDeudor: el deudor, su saldo y sus fiados pendientes. 404 DEUDOR_NO_ENCONTRADO. */
export async function consultarEstadoCuentaApi(
  cliente: ClienteHttp,
  idDeudor: number,
): Promise<ResultadoApi<CuentaDeudor>> {
  const resultado = await cliente.solicitar<unknown>(`${RUTA_CUENTAS_CORRIENTES_API}/${idDeudor}`)
  if (!resultado.exitoso) return resultado
  if (!esEstadoCuentaResponse(resultado.datos)) return crearFalloRespuestaInvalida(200)

  const { deudor, saldo, fiados } = resultado.datos
  const saldoCentavos = convertirTextoACentavos(saldo)
  const fiadosConvertidos = descartarSiHayNulos(fiados.map(convertirFiadoDeEstadoCuentaApi))
  if (saldoCentavos === null || fiadosConvertidos === null) return crearFalloRespuestaInvalida(200)
  return {
    exitoso: true,
    datos: { deudor: convertirDeudorApi(deudor), saldo: convertirCentavosAPesos(saldoCentavos), fiados: fiadosConvertidos },
  }
}

// --- COBRO: PAGOS Y FIADOS DE LA RESPUESTA ---

function esPagoDeCobroApi(valor: unknown): valor is PagoDeCobroApi {
  const esTextoONulo = (candidato: unknown) => candidato === null || typeof candidato === 'string'
  return (
    esObjeto(valor) &&
    typeof valor.idMedioPago === 'number' &&
    typeof valor.nombreMedioPago === 'string' &&
    typeof valor.montoBase === 'string' &&
    typeof valor.porcentajeAplicado === 'string' &&
    typeof valor.montoFinal === 'string' &&
    esTextoONulo(valor.montoRecibido) &&
    esTextoONulo(valor.vuelto)
  )
}

function esFiadoCobradoApi(valor: unknown): valor is FiadoCobradoApi {
  return (
    esObjeto(valor) &&
    typeof valor.idVenta === 'number' &&
    (valor.numeroComprobante === null || typeof valor.numeroComprobante === 'string') &&
    typeof valor.montoAbonado === 'string' &&
    typeof valor.faltaAntes === 'string' &&
    typeof valor.faltaDespues === 'string' &&
    (valor.estado === 'PENDIENTE_PAGO' || valor.estado === 'COMPLETADA')
  )
}

function esRegistrarCobroResponse(valor: unknown): valor is RegistrarCobroResponse {
  return (
    esObjeto(valor) &&
    esObjeto(valor.cobro) &&
    typeof valor.cobro.idCobroDeudor === 'number' &&
    typeof valor.cobro.numeroRecibo === 'string' &&
    typeof valor.cobro.fechaHora === 'string' &&
    esDeudorApi(valor.deudor) &&
    Array.isArray(valor.fiados) &&
    valor.fiados.every(esFiadoCobradoApi) &&
    Array.isArray(valor.pagos) &&
    valor.pagos.every(esPagoDeCobroApi) &&
    typeof valor.totalAbonado === 'string' &&
    typeof valor.totalCobrado === 'string' &&
    typeof valor.saldoDeudorDespues === 'string'
  )
}

function esFiadoDeReciboApi(valor: unknown): valor is ConsultarCobroResponse['fiados'][number] {
  return (
    esObjeto(valor) &&
    typeof valor.idVenta === 'number' &&
    (valor.numeroComprobante === null || typeof valor.numeroComprobante === 'string') &&
    typeof valor.montoAbonado === 'string'
  )
}

function esConsultarCobroResponse(valor: unknown): valor is ConsultarCobroResponse {
  return (
    esObjeto(valor) &&
    esObjeto(valor.cobro) &&
    typeof valor.cobro.idCobroDeudor === 'number' &&
    (valor.cobro.numeroRecibo === null || typeof valor.cobro.numeroRecibo === 'string') &&
    typeof valor.cobro.fechaHora === 'string' &&
    esObjeto(valor.usuario) &&
    typeof valor.usuario.nombre === 'string' &&
    Array.isArray(valor.fiados) &&
    valor.fiados.every(esFiadoDeReciboApi) &&
    Array.isArray(valor.pagos) &&
    valor.pagos.every(esPagoDeCobroApi) &&
    typeof valor.totalCobrado === 'string'
  )
}

/** Suma los vueltos de los pagos en efectivo; null si no hubo ninguno. */
function sumarVueltos(pagos: PagoComprobante[]) {
  const total = pagos.reduce((suma, pago) => suma + (pago.admiteVuelto ? (pago.vuelto ?? 0) : 0), 0)
  return total > 0 ? total : null
}

function convertirFiadoCobrado(fiado: FiadoCobradoApi): FiadoAbonado | null {
  const abonadoCentavos = convertirTextoACentavos(fiado.montoAbonado)
  const faltaCentavos = convertirTextoACentavos(fiado.faltaDespues)
  if (abonadoCentavos === null || faltaCentavos === null) return null
  return {
    idVenta: fiado.idVenta,
    numeroComprobante: fiado.numeroComprobante ?? NUMERO_COMPROBANTE_AUSENTE,
    montoAbonado: convertirCentavosAPesos(abonadoCentavos),
    montoFaltanteResultante: convertirCentavosAPesos(faltaCentavos),
    estadoResultante: fiado.estado,
  }
}

// --- COBRO: ALTA ---

/**
 * POST /api/cuentas-corrientes/:idDeudor/cobros: cobra uno o varios fiados con uno o varios medios. Es todo o nada.
 * No tiene clave de idempotencia: reenviarlo a ciegas puede cobrar dos veces. Un 2xx con una forma que no cumple el
 * contrato se devuelve como fallo incierto (el cobro pudo guardarse), nunca como "no se guardo".
 * @param medios Medios de pago cargados: sirven para saber cuales admiten vuelto.
 */
export async function registrarCobroApi(
  cliente: ClienteHttp,
  idDeudor: number,
  cuerpo: RegistrarCobroRequest,
  medios: MedioPago[],
): Promise<ResultadoApi<CobroDeudorRegistrado>> {
  const resultado = await cliente.solicitar<unknown>(`${RUTA_CUENTAS_CORRIENTES_API}/${idDeudor}/cobros`, {
    metodo: 'POST',
    cuerpo,
  })
  if (!resultado.exitoso) return resultado

  if (!esRegistrarCobroResponse(resultado.datos)) return crearFalloRespuestaInvalida(201)

  const { cobro, fiados, pagos: pagosApi, totalAbonado, totalCobrado, saldoDeudorDespues } = resultado.datos
  const abonadoCentavos = convertirTextoACentavos(totalAbonado)
  const cobradoCentavos = convertirTextoACentavos(totalCobrado)
  const saldoCentavos = convertirTextoACentavos(saldoDeudorDespues)
  const fiadosAbonados = descartarSiHayNulos(fiados.map(convertirFiadoCobrado))
  const pagos = descartarSiHayNulos(pagosApi.map((pago) => convertirPagoApiAComprobante(pago, medios)))
  if (
    abonadoCentavos === null ||
    cobradoCentavos === null ||
    saldoCentavos === null ||
    fiadosAbonados === null ||
    pagos === null
  ) {
    return crearFalloRespuestaInvalida(201)
  }

  return {
    exitoso: true,
    datos: {
      idCobro: cobro.idCobroDeudor,
      numeroRecibo: cobro.numeroRecibo,
      fechaHora: cobro.fechaHora,
      fiadosAbonados,
      pagos,
      montoAbonado: convertirCentavosAPesos(abonadoCentavos),
      montoTotalCobrado: convertirCentavosAPesos(cobradoCentavos),
      vuelto: sumarVueltos(pagos),
      saldoRestanteDeudor: convertirCentavosAPesos(saldoCentavos),
    },
  }
}

// --- RECIBO DE UN COBRO YA GUARDADO ---

/**
 * GET /api/cuentas-corrientes/cobros/:idCobroDeudor: el recibo de un cobro ya guardado. No trae el saldo posterior,
 * ni lo que falto de cada fiado, ni el DNI ni el telefono del deudor: quien lo usa completa lo que falta.
 */
export async function consultarCobroApi(
  cliente: ClienteHttp,
  idCobroDeudor: number,
  medios: MedioPago[],
): Promise<ResultadoApi<CobroConsultado>> {
  const resultado = await cliente.solicitar<unknown>(`${RUTA_CUENTAS_CORRIENTES_API}/cobros/${idCobroDeudor}`)
  if (!resultado.exitoso) return resultado

  if (!esConsultarCobroResponse(resultado.datos)) return crearFalloRespuestaInvalida(200)

  const { cobro, usuario, fiados: fiadosApi, pagos: pagosApi, totalCobrado } = resultado.datos
  const cobradoCentavos = convertirTextoACentavos(totalCobrado)
  const pagos = descartarSiHayNulos(pagosApi.map((pago) => convertirPagoApiAComprobante(pago, medios)))
  const fiados = descartarSiHayNulos(
    fiadosApi.map((fiado) => {
      const abonadoCentavos = convertirTextoACentavos(fiado.montoAbonado)
      return abonadoCentavos === null
        ? null
        : {
            idVenta: fiado.idVenta,
            numeroComprobante: fiado.numeroComprobante ?? NUMERO_COMPROBANTE_AUSENTE,
            montoAbonado: convertirCentavosAPesos(abonadoCentavos),
          }
    }),
  )
  if (cobradoCentavos === null || pagos === null || fiados === null) return crearFalloRespuestaInvalida(200)

  return {
    exitoso: true,
    datos: {
      idCobro: cobro.idCobroDeudor,
      numeroRecibo: cobro.numeroRecibo,
      fechaHora: cobro.fechaHora,
      nombreVendedor: usuario.nombre,
      fiados,
      pagos,
      montoTotalCobrado: convertirCentavosAPesos(cobradoCentavos),
      vuelto: sumarVueltos(pagos),
    },
  }
}
