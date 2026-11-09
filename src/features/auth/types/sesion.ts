import type { UsuarioSesion } from '@/features/auth/types/api-auth'
import type { ClienteHttp } from '@/lib/cliente-http.types'

/** Lo que se guarda en memoria y en localStorage. */
export interface Sesion {
  token: string
  usuario: UsuarioSesion
  /**
   * Instante de vencimiento en milisegundos (epoch). Se calcula con el momento en que se ENVIO
   * el login, no el de la respuesta: asi nunca supera al vencimiento real del token.
   */
  vencimiento: number
}

/** Por que no hay sesion; decide que muestra el login y si se recuerda la ruta. */
export type MotivoCierreSesion = 'voluntario' | 'vencida'

/** Lo que expone el proveedor de sesion a toda la aplicacion. */
export interface ContextoSesion {
  sesion: Sesion | null
  motivoCierre: MotivoCierreSesion | null
  /** Cliente HTTP ya conectado a la sesion: agrega el token y cierra la sesion si el back la rechaza. */
  cliente: ClienteHttp
  iniciarSesion: (sesion: Sesion) => void
  /** Cierre voluntario. El cierre por vencimiento lo resuelve el propio proveedor. */
  cerrarSesion: () => void
}

/** `location.state` que el guard adjunta al redirigir a /iniciar-sesion. */
export interface EstadoRedireccionSesion {
  /** Ruta pedida (pathname + search + hash). Ausente en el cierre voluntario. */
  desde?: string
  motivo?: 'vencida'
}
