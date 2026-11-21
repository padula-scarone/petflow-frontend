import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import {
  leerRespuestaConDevolucion,
  type DevolucionConsultada,
} from '@/features/ventas/devoluciones/api/convertir-devolucion-api'
import type { RegistrarDevolucionRequest } from '@/features/ventas/devoluciones/types/api-devoluciones'

const ESTADO_CREADO = 201

/**
 * POST /api/cambios-mercaderia: registra la devolución y devuelve la devolución guardada (el mismo contenido que el
 * detalle). Un 201 con una forma ilegible vuelve como fallo de tipo RESPUESTA_NO_JSON: la devolución pudo haberse
 * guardado igual, asi que quien llama lo trata como resultado incierto y no reenvia.
 */
export async function registrarDevolucionApi(
  cliente: ClienteHttp,
  cuerpo: RegistrarDevolucionRequest,
): Promise<ResultadoApi<DevolucionConsultada>> {
  const resultado = await cliente.solicitar<unknown>('/api/cambios-mercaderia', { metodo: 'POST', cuerpo })
  if (!resultado.exitoso) return resultado
  return leerRespuestaConDevolucion(resultado.datos, ESTADO_CREADO)
}
