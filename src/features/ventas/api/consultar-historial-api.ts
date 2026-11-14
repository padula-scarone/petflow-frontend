import { esObjeto } from '@/lib/es-objeto'
import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import { crearFalloRespuestaInvalida } from '@/features/ventas/api/crear-fallo-respuesta-invalida'
import { descartarSiHayNulos } from '@/features/ventas/api/descartar-si-hay-nulos'
import { convertirTextoACentavos } from '@/features/ventas/api/conversores-numericos'
import {
  esEstadoVentaApi,
  esModalidadEntregaApi,
  esOrigenApi,
} from '@/features/ventas/api/conversores-enums'
import {
  NUMERO_COMPROBANTE_AUSENTE,
  NUMERO_COMPROBANTE_LONGITUD_MAXIMA,
  TEXTO_CLIENTE_LONGITUD_MAXIMA,
} from '@/features/ventas/config/reglas-venta'
import type {
  ConsultaHistorialApi,
  ConsultarHistorialResponse,
  VentaHistorialApi,
} from '@/features/ventas/types/api-ventas'
import type {
  FiltrosHistorial,
  PaginacionHistorial,
  VentaHistorialConsultada,
} from '@/features/ventas/types/historial'
import { convertirCentavosAPesos } from '@/features/ventas/utils/calcular-centavos'

const RUTA_HISTORIAL_API = '/api/ventas'

/** Una pagina del historial ya traducida, con el desfase entre el reloj del servidor y el del dispositivo. */
export interface PaginaHistorialConsultada {
  ventas: VentaHistorialConsultada[]
  paginacion: PaginacionHistorial
  /** Hora del servidor menos hora local, en milisegundos, medida al recibir la respuesta. */
  desfaseServidorMilisegundos: number
}

// --- REQUEST ---

/** Pasa los filtros de la pantalla a la query del back: omite lo vacio y recorta los textos a su largo maximo. */
export function convertirFiltrosAConsulta(
  filtros: FiltrosHistorial,
  pagina: number,
  cantidadPorPagina: number,
): ConsultaHistorialApi {
  const textoCliente = filtros.textoCliente.trim().slice(0, TEXTO_CLIENTE_LONGITUD_MAXIMA)
  const numeroComprobante = filtros.numeroComprobante.trim().slice(0, NUMERO_COMPROBANTE_LONGITUD_MAXIMA)
  return {
    pagina,
    cantidadPorPagina,
    ...(filtros.fechaDesde !== null && { fechaDesde: filtros.fechaDesde }),
    ...(filtros.fechaHasta !== null && { fechaHasta: filtros.fechaHasta }),
    ...(filtros.productoSeleccionado !== null && { idProducto: filtros.productoSeleccionado.idProducto }),
    ...(filtros.estado !== null && { estado: filtros.estado }),
    ...(filtros.origen !== null && { origen: filtros.origen }),
    ...(filtros.medioPago !== null && { medioPago: filtros.medioPago }),
    ...(textoCliente !== '' && { textoCliente }),
    ...(numeroComprobante !== '' && { numeroComprobante }),
  }
}

/** Serializa la consulta como query string: todo texto, con "MIXTO" en mayusculas. */
export function convertirConsultaAParametros(consulta: ConsultaHistorialApi): Record<string, string> {
  return Object.fromEntries(
    Object.entries(consulta)
      .filter((entrada): entrada is [string, string | number] => entrada[1] !== undefined)
      .map(([clave, valor]) => [clave, String(valor)]),
  )
}

// --- RESPONSE ---

const esEnteroNoNegativo = (valor: unknown) =>
  typeof valor === 'number' && Number.isInteger(valor) && valor >= 0

function esVentaHistorialApi(valor: unknown): valor is VentaHistorialApi {
  return (
    esObjeto(valor) &&
    typeof valor.idVenta === 'number' &&
    (valor.numeroComprobante === null || typeof valor.numeroComprobante === 'string') &&
    typeof valor.fechaHora === 'string' &&
    (esEstadoVentaApi(valor.estado) || valor.estado === 'ANULADA') &&
    (valor.fechaHoraLimiteModificacion === null || typeof valor.fechaHoraLimiteModificacion === 'string') &&
    typeof valor.montoTotal === 'string' &&
    (valor.clienteReferencia === null || typeof valor.clienteReferencia === 'string') &&
    esOrigenApi(valor.origen) &&
    esModalidadEntregaApi(valor.modalidadEntrega) &&
    esEnteroNoNegativo(valor.cantidadCambiosActivos)
  )
}

function esConsultarHistorialResponse(valor: unknown): valor is ConsultarHistorialResponse {
  return (
    esObjeto(valor) &&
    typeof valor.fechaHoraServidor === 'string' &&
    !Number.isNaN(Date.parse(valor.fechaHoraServidor)) &&
    Array.isArray(valor.ventas) &&
    valor.ventas.every(esVentaHistorialApi) &&
    esObjeto(valor.paginacion) &&
    esEnteroNoNegativo(valor.paginacion.pagina) &&
    esEnteroNoNegativo(valor.paginacion.cantidadPorPagina) &&
    esEnteroNoNegativo(valor.paginacion.totalRegistros) &&
    esEnteroNoNegativo(valor.paginacion.totalPaginas)
  )
}

function convertirVentaHistorialApi(venta: VentaHistorialApi): VentaHistorialConsultada | null {
  const montoTotalCentavos = convertirTextoACentavos(venta.montoTotal)
  if (montoTotalCentavos === null) return null
  return {
    idVenta: venta.idVenta,
    numeroComprobante: venta.numeroComprobante ?? NUMERO_COMPROBANTE_AUSENTE,
    fechaHora: venta.fechaHora,
    estado: venta.estado,
    montoTotal: convertirCentavosAPesos(montoTotalCentavos),
    clienteReferencia: venta.clienteReferencia,
    origen: venta.origen,
    modalidadEntrega: venta.modalidadEntrega,
    fechaHoraLimiteModificacion: venta.fechaHoraLimiteModificacion,
    cantidadCambiosActivos: venta.cantidadCambiosActivos,
  }
}

/**
 * GET /api/ventas: una pagina del historial con los filtros aplicados. Una pagina fuera de rango llega con
 * la lista vacia (no es un error): quien llama decide saltar a la ultima.
 */
export async function consultarHistorialApi(
  cliente: ClienteHttp,
  filtros: FiltrosHistorial,
  pagina: number,
  cantidadPorPagina: number,
): Promise<ResultadoApi<PaginaHistorialConsultada>> {
  const resultado = await cliente.solicitar<unknown>(RUTA_HISTORIAL_API, {
    parametros: convertirConsultaAParametros(convertirFiltrosAConsulta(filtros, pagina, cantidadPorPagina)),
  })
  if (!resultado.exitoso) return resultado
  if (!esConsultarHistorialResponse(resultado.datos)) return crearFalloRespuestaInvalida(200)

  const ventas = descartarSiHayNulos(resultado.datos.ventas.map(convertirVentaHistorialApi))
  if (ventas === null) return crearFalloRespuestaInvalida(200)
  return {
    exitoso: true,
    datos: {
      ventas,
      paginacion: resultado.datos.paginacion,
      desfaseServidorMilisegundos: Date.parse(resultado.datos.fechaHoraServidor) - Date.now(),
    },
  }
}
