import type { CredencialesInicioSesion } from '@/features/auth/types/inicio-sesion'

/** Roles del sistema. Replica ROLES_USUARIO del back. */
export type RolUsuario = 'VENDEDOR' | 'GESTOR_COMERCIAL' | 'GERENTE'

/** Datos publicos del usuario que devuelve el login. */
export interface UsuarioSesion {
  idUsuario: number
  username: string
  nombre: string
  rol: RolUsuario
}

/**
 * Body de POST /api/auth/login. Mismas reglas que iniciarSesionSchema del back:
 * `username` recortado, no vacio y de hasta 50 caracteres; `clave` sin recortar y no vacia.
 */
export type IniciarSesionRequest = CredencialesInicioSesion

/** Respuesta 200 de POST /api/auth/login. */
export interface IniciarSesionResponse {
  exito: true
  mensaje: string
  token: string
  tipoToken: 'Bearer'
  /** Vigencia del token en segundos (28800 = 8 h). */
  vigenciaSegundos: number
  usuario: UsuarioSesion
}
