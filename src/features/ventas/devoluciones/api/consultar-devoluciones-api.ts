import { esObjeto } from '@/lib/es-objeto'
import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import { convertirConsultaAParametros } from '@/features/ventas/api/consultar-historial-api'
import { crearFalloRespuestaInvalida } from '@/features/ventas/api/crear-fallo-respuesta-invalida'
import { descartarSiHayNulos } from '@/features/ventas/api/descartar-si-hay-nulos'
import { convertirDevolucionListadoApi } from '@/features/ventas/devoluciones/api/convertir-devolucion-api'
import {
  esDevolucionListadoApi,
  esEnteroNoNegativo,
} from '@/features/ventas/devoluciones/api/validar-respuesta-devoluciones'
import type {
  ConsultaDevolucionesApi,
  ConsultarDevolucionesResponse,
} from '@/features/ventas/devoluciones/types/api-devoluciones'
import type {
  DevolucionListado,
  FiltrosDevoluciones,
} from '@/features/ventas/devoluciones/types/devolucion'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'

const RUTA_DEVOLUCIONES_API = '/api/cambios-mercaderia'

/** Una pagina de devoluciones ya traducida, con el desfase entre el reloj del servidor y el del dispositivo. */
export interface PaginaDevolucionesConsultada {
  devoluciones: DevolucionListado[]
  paginacion: PaginacionResultados
  /** Hora del servidor menos hora local, en milisegundos, medida al recibir la respuesta. */
  desfaseServidorMilisegundos: number
}

// --- REQUEST ---

/** Pasa los filtros de la pantalla a la query del back: omite lo vacio (un valor vacio no se manda). */
export function convertirFiltrosADevolucionesConsulta(
  filtros: FiltrosDevoluciones,
  pagina: number,
  cantidadPorPagina: number,
): ConsultaDevolucionesApi {
  return {
    pagina,
    cantidadPorPagina,
    ...(filtros.fechaDesde !== null && { fechaDesde: filtros.fechaDesde }),
    ...(filtros.fechaHasta !== null && { fechaHasta: filtros.fechaHasta }),
    ...(filtros.productoSeleccionado !== null && { idProducto: filtros.productoSeleccionado.idProducto }),
    ...(filtros.estado !== null && { estado: filtros.estado }),
    ...(filtros.vinculo !== null && { vinculo: filtros.vinculo }),
    // El front lo llama medioPago; el back, idMedioPago
    ...(filtros.medioPago !== null && { idMedioPago: filtros.medioPago }),
  }
}

// --- RESPONSE ---

function esConsultarDevolucionesResponse(valor: unknown): valor is ConsultarDevolucionesResponse {
  return (
    esObjeto(valor) &&
    typeof valor.fechaHoraServidor === 'string' &&
    !Number.isNaN(Date.parse(valor.fechaHoraServidor)) &&
    Array.isArray(valor.cambios) &&
    valor.cambios.every(esDevolucionListadoApi) &&
    esObjeto(valor.paginacion) &&
    esEnteroNoNegativo(valor.paginacion.pagina) &&
    esEnteroNoNegativo(valor.paginacion.cantidadPorPagina) &&
    esEnteroNoNegativo(valor.paginacion.totalRegistros) &&
    esEnteroNoNegativo(valor.paginacion.totalPaginas)
  )
}

/**
 * GET /api/cambios-mercaderia: una pagina del historial de devoluciones con los filtros aplicados. Una pagina fuera
 * de rango llega con la lista vacia (no es un error): quien llama decide saltar a la ultima.
 */
export async function consultarDevolucionesApi(
  cliente: ClienteHttp,
  filtros: FiltrosDevoluciones,
  pagina: number,
  cantidadPorPagina: number,
): Promise<ResultadoApi<PaginaDevolucionesConsultada>> {
  const resultado = await cliente.solicitar<unknown>(RUTA_DEVOLUCIONES_API, {
    parametros: convertirConsultaAParametros(convertirFiltrosADevolucionesConsulta(filtros, pagina, cantidadPorPagina)),
  })
  if (!resultado.exitoso) return resultado
  if (!esConsultarDevolucionesResponse(resultado.datos)) return crearFalloRespuestaInvalida(200)

  const devoluciones = descartarSiHayNulos(resultado.datos.cambios.map(convertirDevolucionListadoApi))
  if (devoluciones === null) return crearFalloRespuestaInvalida(200)
  return {
    exitoso: true,
    datos: {
      devoluciones,
      paginacion: resultado.datos.paginacion,
      desfaseServidorMilisegundos: Date.parse(resultado.datos.fechaHoraServidor) - Date.now(),
    },
  }
}
