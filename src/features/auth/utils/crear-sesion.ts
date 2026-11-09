import type { IniciarSesionResponse } from '@/features/auth/types/api-auth'
import type { Sesion } from '@/features/auth/types/sesion'

/**
 * Arma la sesion a partir de la respuesta del login.
 * @param momentoSolicitud Instante (ms) en que se ENVIO el login: el token se emitio despues, asi
 * que el vencimiento calculado desde aqui nunca supera al real.
 */
export function crearSesion(respuesta: IniciarSesionResponse, momentoSolicitud: number): Sesion {
  const { idUsuario, username, nombre, rol } = respuesta.usuario
  return {
    token: respuesta.token,
    // Campos explicitos: no se guarda nada que el back agregue en el futuro sin que el front lo pida
    usuario: { idUsuario, username, nombre, rol },
    vencimiento: momentoSolicitud + respuesta.vigenciaSegundos * 1000,
  }
}
