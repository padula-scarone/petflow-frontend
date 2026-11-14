import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import {
  leerRespuestaConCambio,
  type CambioConsultado,
} from '@/features/ventas/cambios-mercaderia/api/convertir-cambio-api'

const ESTADO_OK = 200

/** GET /api/cambios-mercaderia/:idCambio: el cambio completo, valido para cualquier estado. */
export async function consultarCambioApi(
  cliente: ClienteHttp,
  idCambio: number,
): Promise<ResultadoApi<CambioConsultado>> {
  const resultado = await cliente.solicitar<unknown>(`/api/cambios-mercaderia/${idCambio}`)
  if (!resultado.exitoso) return resultado
  return leerRespuestaConCambio(resultado.datos, ESTADO_OK)
}
