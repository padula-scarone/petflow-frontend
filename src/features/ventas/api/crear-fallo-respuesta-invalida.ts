import type { ResultadoApi } from '@/lib/cliente-http.types'

/**
 * Fallo para una respuesta exitosa (2xx) cuya forma no cumple el contrato. Se reutiliza el tipo
 * RESPUESTA_NO_JSON, igual que en el login: para el llamador es una respuesta que no puede usar.
 */
export function crearFalloRespuestaInvalida(estado: number): ResultadoApi<never> {
  return {
    exitoso: false,
    error: { tipo: 'RESPUESTA_NO_JSON', estado, mensaje: null, errores: [] },
  }
}
