import { esObjeto } from '@/lib/es-objeto'
import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import { crearFalloRespuestaInvalida } from '@/features/ventas/api/crear-fallo-respuesta-invalida'
import {
  convertirDeudorApi,
  esDeudorApi,
  esPaginacionApi,
} from '@/features/ventas/deudores/api/conversores-deudores'
import type { ConsultaDeudoresApi, DatosDeudorRequest } from '@/features/ventas/deudores/types/api-deudores'
import type { DatosDeudor, Deudor } from '@/features/ventas/deudores/types/deudor'

const RUTA_DEUDORES_API = '/api/deudores'

// --- REQUEST ---

/** Pasa lo que escribio el vendedor al body del alta y la edicion. El telefono ya llega normalizado. */
export function convertirDatosDeudorACuerpo(datos: DatosDeudor): DatosDeudorRequest {
  return { nombreCompleto: datos.nombreCompleto, telefono: datos.telefono, dni: datos.dni }
}

// --- RESPONSE ---

/** Valida y convierte la respuesta del alta o la edicion: `{ mensaje, deudor }`. */
function leerDeudorGuardado(datos: unknown): ResultadoApi<Deudor> {
  if (!esObjeto(datos) || !esDeudorApi(datos.deudor)) return crearFalloRespuestaInvalida(200)
  return { exitoso: true, datos: convertirDeudorApi(datos.deudor) }
}

/**
 * GET /api/deudores?busqueda=: deudores cuyo nombre o DNI contienen el texto. La busqueda por DNI viaja en la URL
 * porque asi es el contrato; nunca se escribe en un log ni en un mensaje.
 */
export async function buscarDeudoresApi(
  cliente: ClienteHttp,
  consulta: ConsultaDeudoresApi,
): Promise<ResultadoApi<Deudor[]>> {
  const resultado = await cliente.solicitar<unknown>(RUTA_DEUDORES_API, {
    parametros: { busqueda: consulta.busqueda, cantidadPorPagina: String(consulta.cantidadPorPagina) },
  })
  if (!resultado.exitoso) return resultado

  const { datos } = resultado
  if (!esObjeto(datos) || !Array.isArray(datos.deudores) || !esPaginacionApi(datos.paginacion)) {
    return crearFalloRespuestaInvalida(200)
  }
  const deudores = datos.deudores.filter(esDeudorApi)
  // Un solo elemento con otra forma invalida toda la respuesta: no se muestra una lista a medias
  if (deudores.length !== datos.deudores.length) return crearFalloRespuestaInvalida(200)
  return { exitoso: true, datos: deudores.map(convertirDeudorApi) }
}

/** POST /api/deudores: da de alta un deudor. 409 DNI_DUPLICADO trae al deudor que ya tiene ese DNI (en `error.cuerpo`). */
export async function crearDeudorApi(cliente: ClienteHttp, datos: DatosDeudor): Promise<ResultadoApi<Deudor>> {
  const resultado = await cliente.solicitar<unknown>(RUTA_DEUDORES_API, {
    metodo: 'POST',
    cuerpo: convertirDatosDeudorACuerpo(datos),
  })
  return resultado.exitoso ? leerDeudorGuardado(resultado.datos) : resultado
}

/** PUT /api/deudores/:idDeudor: reemplaza nombre, telefono y DNI. Sin cambios devuelve 200, no 409. */
export async function editarDeudorApi(
  cliente: ClienteHttp,
  idDeudor: number,
  datos: DatosDeudor,
): Promise<ResultadoApi<Deudor>> {
  const resultado = await cliente.solicitar<unknown>(`${RUTA_DEUDORES_API}/${idDeudor}`, {
    metodo: 'PUT',
    cuerpo: convertirDatosDeudorACuerpo(datos),
  })
  return resultado.exitoso ? leerDeudorGuardado(resultado.datos) : resultado
}
