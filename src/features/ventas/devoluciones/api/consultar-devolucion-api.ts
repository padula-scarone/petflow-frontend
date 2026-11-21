import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import {
  leerRespuestaConDevolucion,
  type DevolucionConsultada,
} from '@/features/ventas/devoluciones/api/convertir-devolucion-api'

const ESTADO_OK = 200

/** GET /api/cambios-mercaderia/:idCambio: la devolución completa, valido para cualquier estado. */
export async function consultarDevolucionApi(
  cliente: ClienteHttp,
  idDevolucion: number,
): Promise<ResultadoApi<DevolucionConsultada>> {
  const resultado = await cliente.solicitar<unknown>(`/api/cambios-mercaderia/${idDevolucion}`)
  if (!resultado.exitoso) return resultado
  return leerRespuestaConDevolucion(resultado.datos, ESTADO_OK)
}
