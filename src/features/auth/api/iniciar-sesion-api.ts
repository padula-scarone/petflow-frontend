import { esObjeto } from '@/lib/es-objeto'
import type { IniciarSesionRequest, IniciarSesionResponse } from '@/features/auth/types/api-auth'
import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'

const RUTA_INICIAR_SESION_API = '/api/auth/login'

/** Un 200 sin la forma del contrato se trata como respuesta invalida, no como sesion. */
function esIniciarSesionResponse(valor: unknown): valor is IniciarSesionResponse {
  return (
    esObjeto(valor) &&
    typeof valor.token === 'string' &&
    valor.token !== '' &&
    typeof valor.vigenciaSegundos === 'number' &&
    esObjeto(valor.usuario) &&
    typeof valor.usuario.idUsuario === 'number' &&
    typeof valor.usuario.username === 'string' &&
    typeof valor.usuario.nombre === 'string' &&
    typeof valor.usuario.rol === 'string'
  )
}

/**
 * POST /api/auth/login. Sin sesion: no lleva token, y su 401 son credenciales invalidas,
 * no una sesion vencida. Envia las credenciales tal cual; recortar `username` es tarea del llamador.
 */
export async function iniciarSesionApi(
  cliente: ClienteHttp,
  credenciales: IniciarSesionRequest,
): Promise<ResultadoApi<IniciarSesionResponse>> {
  const resultado = await cliente.solicitar<unknown>(RUTA_INICIAR_SESION_API, {
    metodo: 'POST',
    cuerpo: credenciales,
    conSesion: false,
  })
  if (!resultado.exitoso) return resultado
  if (!esIniciarSesionResponse(resultado.datos)) {
    return {
      exitoso: false,
      error: { tipo: 'RESPUESTA_NO_JSON', estado: 200, mensaje: null, errores: [] },
    }
  }
  return { exitoso: true, datos: resultado.datos }
}
