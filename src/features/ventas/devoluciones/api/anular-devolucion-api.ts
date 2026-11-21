import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import {
  leerRespuestaConDevolucion,
  type DevolucionConsultada,
} from '@/features/ventas/devoluciones/api/convertir-devolucion-api'
import type { AnularDevolucionRequest } from '@/features/ventas/devoluciones/types/api-devoluciones'

const ESTADO_OK = 200

/**
 * POST /api/cambios-mercaderia/:idCambio/anulacion (Anular y Editar usan el mismo endpoint). Devuelve la devolución
 * ya ANULADA con su auditoria. Un 200 con una forma ilegible vuelve como fallo: la devolución pudo anularse igual,
 * asi que quien llama lo trata como resultado incierto y consulta el detalle.
 */
export async function anularDevolucionApi(
  cliente: ClienteHttp,
  idDevolucion: number,
  motivo: string,
): Promise<ResultadoApi<DevolucionConsultada>> {
  const cuerpo: AnularDevolucionRequest = { motivo }
  const resultado = await cliente.solicitar<unknown>(`/api/cambios-mercaderia/${idDevolucion}/anulacion`, {
    metodo: 'POST',
    cuerpo,
  })
  if (!resultado.exitoso) return resultado
  return leerRespuestaConDevolucion(resultado.datos, ESTADO_OK)
}
