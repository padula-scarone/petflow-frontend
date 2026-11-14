import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import {
  leerRespuestaConCambio,
  type CambioConsultado,
} from '@/features/ventas/cambios-mercaderia/api/convertir-cambio-api'
import type { AnularCambioRequest } from '@/features/ventas/cambios-mercaderia/types/api-cambios'

const ESTADO_OK = 200

/**
 * POST /api/cambios-mercaderia/:idCambio/anulacion (Anular y Editar usan el mismo endpoint). Devuelve el cambio
 * ya ANULADO con su auditoria. Un 200 con una forma ilegible vuelve como fallo: el cambio pudo anularse igual,
 * asi que quien llama lo trata como resultado incierto y consulta el detalle.
 */
export async function anularCambioApi(
  cliente: ClienteHttp,
  idCambio: number,
  motivo: string,
): Promise<ResultadoApi<CambioConsultado>> {
  const cuerpo: AnularCambioRequest = { motivo }
  const resultado = await cliente.solicitar<unknown>(`/api/cambios-mercaderia/${idCambio}/anulacion`, {
    metodo: 'POST',
    cuerpo,
  })
  if (!resultado.exitoso) return resultado
  return leerRespuestaConCambio(resultado.datos, ESTADO_OK)
}
