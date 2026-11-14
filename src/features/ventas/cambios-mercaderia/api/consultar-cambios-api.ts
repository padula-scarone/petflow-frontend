import { esObjeto } from '@/lib/es-objeto'
import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import { convertirConsultaAParametros } from '@/features/ventas/api/consultar-historial-api'
import { crearFalloRespuestaInvalida } from '@/features/ventas/api/crear-fallo-respuesta-invalida'
import { descartarSiHayNulos } from '@/features/ventas/api/descartar-si-hay-nulos'
import { convertirCambioListadoApi } from '@/features/ventas/cambios-mercaderia/api/convertir-cambio-api'
import {
  esCambioListadoApi,
  esEnteroNoNegativo,
} from '@/features/ventas/cambios-mercaderia/api/validar-respuesta-cambios'
import type {
  ConsultaCambiosApi,
  ConsultarCambiosResponse,
} from '@/features/ventas/cambios-mercaderia/types/api-cambios'
import type {
  CambioMercaderiaListado,
  FiltrosCambios,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'

const RUTA_CAMBIOS_API = '/api/cambios-mercaderia'

/** Una pagina de cambios ya traducida, con el desfase entre el reloj del servidor y el del dispositivo. */
export interface PaginaCambiosConsultada {
  cambios: CambioMercaderiaListado[]
  paginacion: PaginacionResultados
  /** Hora del servidor menos hora local, en milisegundos, medida al recibir la respuesta. */
  desfaseServidorMilisegundos: number
}

// --- REQUEST ---

/** Pasa los filtros de la pantalla a la query del back: omite lo vacio (un valor vacio no se manda). */
export function convertirFiltrosACambiosConsulta(
  filtros: FiltrosCambios,
  pagina: number,
  cantidadPorPagina: number,
): ConsultaCambiosApi {
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

function esConsultarCambiosResponse(valor: unknown): valor is ConsultarCambiosResponse {
  return (
    esObjeto(valor) &&
    typeof valor.fechaHoraServidor === 'string' &&
    !Number.isNaN(Date.parse(valor.fechaHoraServidor)) &&
    Array.isArray(valor.cambios) &&
    valor.cambios.every(esCambioListadoApi) &&
    esObjeto(valor.paginacion) &&
    esEnteroNoNegativo(valor.paginacion.pagina) &&
    esEnteroNoNegativo(valor.paginacion.cantidadPorPagina) &&
    esEnteroNoNegativo(valor.paginacion.totalRegistros) &&
    esEnteroNoNegativo(valor.paginacion.totalPaginas)
  )
}

/**
 * GET /api/cambios-mercaderia: una pagina del historial de cambios con los filtros aplicados. Una pagina fuera
 * de rango llega con la lista vacia (no es un error): quien llama decide saltar a la ultima.
 */
export async function consultarCambiosApi(
  cliente: ClienteHttp,
  filtros: FiltrosCambios,
  pagina: number,
  cantidadPorPagina: number,
): Promise<ResultadoApi<PaginaCambiosConsultada>> {
  const resultado = await cliente.solicitar<unknown>(RUTA_CAMBIOS_API, {
    parametros: convertirConsultaAParametros(convertirFiltrosACambiosConsulta(filtros, pagina, cantidadPorPagina)),
  })
  if (!resultado.exitoso) return resultado
  if (!esConsultarCambiosResponse(resultado.datos)) return crearFalloRespuestaInvalida(200)

  const cambios = descartarSiHayNulos(resultado.datos.cambios.map(convertirCambioListadoApi))
  if (cambios === null) return crearFalloRespuestaInvalida(200)
  return {
    exitoso: true,
    datos: {
      cambios,
      paginacion: resultado.datos.paginacion,
      desfaseServidorMilisegundos: Date.parse(resultado.datos.fechaHoraServidor) - Date.now(),
    },
  }
}
