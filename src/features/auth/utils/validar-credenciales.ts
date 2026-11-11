import {
  LONGITUD_MAXIMA_USERNAME,
  MENSAJE_CLAVE_VACIA,
  MENSAJE_USERNAME_LARGO,
  MENSAJE_USERNAME_VACIO,
} from '@/features/auth/config/reglas-inicio-sesion'
import type {
  CredencialesInicioSesion,
  ErroresCamposInicioSesion,
} from '@/features/auth/types/inicio-sesion'

/** Mismas reglas que iniciarSesionSchema del back: username recortado, no vacio y de hasta 50; clave sin recortar y no vacia. */
export function validarCredenciales(
  credenciales: CredencialesInicioSesion,
): ErroresCamposInicioSesion {
  const usernameRecortado = credenciales.username.trim()
  return {
    ...(usernameRecortado === '' && { username: MENSAJE_USERNAME_VACIO }),
    ...(usernameRecortado.length > LONGITUD_MAXIMA_USERNAME && { username: MENSAJE_USERNAME_LARGO }),
    ...(credenciales.clave === '' && { clave: MENSAJE_CLAVE_VACIA }),
  }
}
