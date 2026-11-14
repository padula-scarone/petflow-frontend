import { esObjeto } from '@/lib/es-objeto'
import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import { crearFalloRespuestaInvalida } from '@/features/ventas/api/crear-fallo-respuesta-invalida'
import { convertirTextoACentavos } from '@/features/ventas/api/conversores-numericos'
import type {
  CobrarFiadoRequest,
  CobrarFiadoResponse,
  PagoRegistradoApi,
  PagoRequest,
} from '@/features/ventas/types/api-ventas'
import { convertirCentavosAPesos } from '@/features/ventas/utils/calcular-centavos'

/** Lo que importa de un cobro confirmado por el back. */
export interface CobroConfirmado {
  /** Total realmente cobrado, con los ajustes del dia: puede diferir del importe adeudado. */
  montoTotal: number
  /** Suma de los vueltos en efectivo; null si no hubo. */
  vuelto: number | null
}

const ESTADO_OK = 200

function esPagoRegistradoApi(valor: unknown): valor is PagoRegistradoApi {
  return (
    esObjeto(valor) &&
    typeof valor.idMedioPago === 'number' &&
    typeof valor.montoFinal === 'string' &&
    (valor.montoRecibido === null || typeof valor.montoRecibido === 'string') &&
    (valor.vuelto === null || typeof valor.vuelto === 'string')
  )
}

function esCobrarFiadoResponse(valor: unknown): valor is CobrarFiadoResponse {
  return (
    esObjeto(valor) &&
    esObjeto(valor.venta) &&
    typeof valor.venta.idVenta === 'number' &&
    valor.venta.estado === 'COMPLETADA' &&
    typeof valor.venta.montoTotal === 'string' &&
    typeof valor.venta.fechaHoraPago === 'string' &&
    Array.isArray(valor.venta.pagos) &&
    valor.venta.pagos.every(esPagoRegistradoApi)
  )
}

/**
 * POST /api/ventas/:idVenta/cobro. Un 200 con una forma que no cumple el contrato se devuelve como fallo:
 * el cobro pudo hacerse igual, asi que quien llama lo trata como resultado incierto y consulta el detalle.
 */
export async function cobrarFiadoApi(
  cliente: ClienteHttp,
  idVenta: number,
  pagos: PagoRequest[],
): Promise<ResultadoApi<CobroConfirmado>> {
  const cuerpo: CobrarFiadoRequest = { pagos }
  const resultado = await cliente.solicitar<unknown>(`/api/ventas/${idVenta}/cobro`, {
    metodo: 'POST',
    cuerpo,
  })
  if (!resultado.exitoso) return resultado
  if (!esCobrarFiadoResponse(resultado.datos)) return crearFalloRespuestaInvalida(ESTADO_OK)

  const { venta } = resultado.datos
  const montoTotalCentavos = convertirTextoACentavos(venta.montoTotal)
  const vueltosCentavos = venta.pagos.map((pago) =>
    pago.vuelto === null ? 0 : convertirTextoACentavos(pago.vuelto),
  )
  if (montoTotalCentavos === null || vueltosCentavos.includes(null)) {
    return crearFalloRespuestaInvalida(ESTADO_OK)
  }
  const vueltoTotalCentavos = vueltosCentavos.reduce<number>((suma, vuelto) => suma + (vuelto ?? 0), 0)
  return {
    exitoso: true,
    datos: {
      montoTotal: convertirCentavosAPesos(montoTotalCentavos),
      vuelto: vueltoTotalCentavos > 0 ? convertirCentavosAPesos(vueltoTotalCentavos) : null,
    },
  }
}
