import type { CampoInicioSesion } from '@/features/auth/types/inicio-sesion'

/** Largo maximo de `username`: coincide con el limite de la columna usuarios.username del back. */
export const LONGITUD_MAXIMA_USERNAME = 50

/** Campos del formulario que el back puede reportar en los 400. */
export const CAMPOS_INICIO_SESION: readonly CampoInicioSesion[] = ['username', 'clave']

// --- MENSAJES ---
// Propios del front: los mensajes de los 400 del back son los de Zod (en ingles y tecnicos).
export const MENSAJE_USERNAME_VACIO = 'Ingresá tu usuario'
export const MENSAJE_USERNAME_LARGO = `El usuario no puede superar los ${LONGITUD_MAXIMA_USERNAME} caracteres`
export const MENSAJE_CLAVE_VACIA = 'Ingresá tu contraseña'

/** Mensaje por campo cuando el back rechaza un campo sin que el front sepa el motivo. */
export const MENSAJES_CAMPO_INVALIDO: Record<CampoInicioSesion, string> = {
  username: 'Revisá el usuario ingresado',
  clave: 'Revisá la contraseña ingresada',
}

export const MENSAJE_CREDENCIALES_INVALIDAS = 'Credenciales inválidas'
export const MENSAJE_DATOS_INVALIDOS = 'Revisá los datos ingresados.'
export const MENSAJE_SIN_RED =
  'No hay conexión con el servidor. Revisá tu internet e intentá de nuevo.'
export const MENSAJE_TIEMPO_AGOTADO = 'El servidor tardó demasiado en responder. Intentá de nuevo.'
export const MENSAJE_SERVIDOR_NO_DISPONIBLE =
  'El servidor no está disponible. Intentá de nuevo en unos minutos.'
export const MENSAJE_SESION_VENCIDA = 'Tu sesión venció. Ingresá de nuevo.'
