import {
  CAMPOS_INICIO_SESION,
  MENSAJES_CAMPO_INVALIDO,
  MENSAJE_CREDENCIALES_INVALIDAS,
  MENSAJE_DATOS_INVALIDOS,
  MENSAJE_SERVIDOR_NO_DISPONIBLE,
  MENSAJE_SIN_RED,
  MENSAJE_TIEMPO_AGOTADO,
} from '@/features/auth/config/reglas-inicio-sesion'
import type {
  CampoInicioSesion,
  ErroresCamposInicioSesion,
} from '@/features/auth/types/inicio-sesion'
import type { ErrorApi } from '@/lib/cliente-http.types'

/** Lo que la vista muestra ante un error del login. */
export interface ErroresInicioSesion {
  errorGeneral: string | null
  erroresCampos: ErroresCamposInicioSesion
}

const ESTADO_DATOS_INVALIDOS = 400
const ESTADO_CREDENCIALES_INVALIDAS = 401

function esCampoInicioSesion(campo: string): campo is CampoInicioSesion {
  return CAMPOS_INICIO_SESION.some((campoConocido) => campoConocido === campo)
}

function soloError(errorGeneral: string): ErroresInicioSesion {
  return { errorGeneral, erroresCampos: {} }
}

/**
 * Traduce un error de POST /api/auth/login a mensajes para la vista. Nunca muestra el detalle
 * tecnico ni el texto de los 400 del back (son los de Zod, en ingles).
 */
export function traducirErrorInicioSesion(error: ErrorApi): ErroresInicioSesion {
  if (error.tipo === 'SIN_RED') return soloError(MENSAJE_SIN_RED)
  if (error.tipo === 'TIEMPO_AGOTADO') return soloError(MENSAJE_TIEMPO_AGOTADO)
  if (error.tipo === 'RESPUESTA_NO_JSON') return soloError(MENSAJE_SERVIDOR_NO_DISPONIBLE)
  // 401 del login: credenciales invalidas, sin decir si fallo el usuario o la clave
  if (error.estado === ESTADO_CREDENCIALES_INVALIDAS) return soloError(MENSAJE_CREDENCIALES_INVALIDAS)

  if (error.estado === ESTADO_DATOS_INVALIDOS) {
    const erroresCampos = Object.fromEntries(
      error.errores
        .map((errorCampo) => errorCampo.campo)
        .filter(esCampoInicioSesion)
        .map((campo) => [campo, MENSAJES_CAMPO_INVALIDO[campo]]),
    ) as ErroresCamposInicioSesion
    return Object.keys(erroresCampos).length > 0
      ? { errorGeneral: null, erroresCampos }
      : soloError(MENSAJE_DATOS_INVALIDOS)
  }

  // 5xx y cualquier otro estado inesperado
  return soloError(MENSAJE_SERVIDOR_NO_DISPONIBLE)
}
