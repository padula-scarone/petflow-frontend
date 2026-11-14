import { esObjeto } from '@/lib/es-objeto'
import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import { crearFalloRespuestaInvalida } from '@/features/ventas/api/crear-fallo-respuesta-invalida'
import { esEstadoVentaApi } from '@/features/ventas/api/conversores-enums'
import type {
  AnularVentaRequest,
  AnularVentaResponse,
  EstadoVentaApi,
} from '@/features/ventas/types/api-ventas'

/** Lo que importa de una anulacion confirmada por el back. */
export interface AnulacionConfirmada {
  /** COMPLETADA: se repuso el stock y se revirtio la caja. PENDIENTE_PAGO: solo stock. */
  estadoAnterior: EstadoVentaApi
}

const ESTADO_OK = 200

function esAnularVentaResponse(valor: unknown): valor is AnularVentaResponse {
  return (
    esObjeto(valor) &&
    esObjeto(valor.venta) &&
    typeof valor.venta.idVenta === 'number' &&
    valor.venta.estado === 'ANULADA' &&
    esEstadoVentaApi(valor.venta.estadoAnterior)
  )
}

/**
 * POST /api/ventas/:idVenta/anulacion (Anular y Editar usan el mismo endpoint). Un 200 con una forma que
 * no cumple el contrato se devuelve como fallo: la venta pudo anularse igual, asi que quien llama lo trata
 * como resultado incierto y consulta el detalle.
 */
export async function anularVentaApi(
  cliente: ClienteHttp,
  idVenta: number,
  motivo: string,
): Promise<ResultadoApi<AnulacionConfirmada>> {
  const cuerpo: AnularVentaRequest = { motivo }
  const resultado = await cliente.solicitar<unknown>(`/api/ventas/${idVenta}/anulacion`, {
    metodo: 'POST',
    cuerpo,
  })
  if (!resultado.exitoso) return resultado
  if (!esAnularVentaResponse(resultado.datos)) return crearFalloRespuestaInvalida(ESTADO_OK)
  return { exitoso: true, datos: { estadoAnterior: resultado.datos.venta.estadoAnterior } }
}
