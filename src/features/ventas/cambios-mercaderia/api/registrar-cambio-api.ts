import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import {
  leerRespuestaConCambio,
  type CambioConsultado,
} from '@/features/ventas/cambios-mercaderia/api/convertir-cambio-api'
import type { RegistrarCambioRequest } from '@/features/ventas/cambios-mercaderia/types/api-cambios'

const ESTADO_CREADO = 201

/**
 * POST /api/cambios-mercaderia: registra el cambio y devuelve el cambio guardado (el mismo contenido que el
 * detalle). Un 201 con una forma ilegible vuelve como fallo de tipo RESPUESTA_NO_JSON: el cambio pudo haberse
 * guardado igual, asi que quien llama lo trata como resultado incierto y no reenvia.
 */
export async function registrarCambioApi(
  cliente: ClienteHttp,
  cuerpo: RegistrarCambioRequest,
): Promise<ResultadoApi<CambioConsultado>> {
  const resultado = await cliente.solicitar<unknown>('/api/cambios-mercaderia', { metodo: 'POST', cuerpo })
  if (!resultado.exitoso) return resultado
  return leerRespuestaConCambio(resultado.datos, ESTADO_CREADO)
}
