import { esObjeto } from '@/lib/es-objeto'
import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import { crearFalloRespuestaInvalida } from '@/features/ventas/api/crear-fallo-respuesta-invalida'
import { descartarSiHayNulos } from '@/features/ventas/api/descartar-si-hay-nulos'
import { convertirTextoABasisPoints } from '@/features/ventas/api/conversores-numericos'
import { esTipoMedioPagoApi } from '@/features/ventas/api/conversores-enums'
import { ICONOS_MEDIO_PAGO } from '@/features/ventas/config/iconos-medio-pago'
import type { ListarMediosPagoResponse, MedioPagoApi } from '@/features/ventas/types/api-ventas'
import type { MedioPago, TipoAjuste } from '@/features/ventas/types/cobro'

const RUTA_MEDIOS_PAGO_API = '/api/medios-pago'
const PUNTOS_BASICOS_POR_PUNTO_PORCENTUAL = 100

function esMedioPagoApi(valor: unknown): valor is MedioPagoApi {
  return (
    esObjeto(valor) &&
    typeof valor.idMedioPago === 'number' &&
    typeof valor.nombre === 'string' &&
    esTipoMedioPagoApi(valor.tipo) &&
    typeof valor.porcentajeRecargo === 'string' &&
    typeof valor.porcentajeDescuento === 'string'
  )
}

function esListarMediosPagoResponse(valor: unknown): valor is ListarMediosPagoResponse {
  return esObjeto(valor) && Array.isArray(valor.mediosPago) && valor.mediosPago.every(esMedioPagoApi)
}

/**
 * Traduce un medio del back al del front. El ajuste neto es recargo menos descuento: su signo decide el
 * tipo de ajuste. Devuelve null si algun porcentaje no es un numero valido.
 */
function convertirMedioPagoApi(medio: MedioPagoApi): MedioPago | null {
  const recargoPuntosBasicos = convertirTextoABasisPoints(medio.porcentajeRecargo)
  const descuentoPuntosBasicos = convertirTextoABasisPoints(medio.porcentajeDescuento)
  if (recargoPuntosBasicos === null || descuentoPuntosBasicos === null) return null

  const ajusteNeto = recargoPuntosBasicos - descuentoPuntosBasicos
  const tipoAjuste: TipoAjuste = ajusteNeto > 0 ? 'recargo' : ajusteNeto < 0 ? 'descuento' : 'ninguno'
  return {
    idMedioPago: medio.idMedioPago,
    nombre: medio.nombre,
    icono: ICONOS_MEDIO_PAGO[medio.tipo],
    tipoAjuste,
    porcentajeAjuste: Math.abs(ajusteNeto) / PUNTOS_BASICOS_POR_PUNTO_PORCENTUAL,
    // Solo el efectivo admite "Paga con" y vuelto
    admiteVuelto: medio.tipo === 'EFECTIVO',
  }
}

/** GET /api/medios-pago: los medios activos, ordenados por id. */
export async function listarMediosPagoApi(
  cliente: ClienteHttp,
): Promise<ResultadoApi<MedioPago[]>> {
  const resultado = await cliente.solicitar<unknown>(RUTA_MEDIOS_PAGO_API)
  if (!resultado.exitoso) return resultado
  if (!esListarMediosPagoResponse(resultado.datos)) return crearFalloRespuestaInvalida(200)

  const medios = descartarSiHayNulos(resultado.datos.mediosPago.map(convertirMedioPagoApi))
  if (medios === null) return crearFalloRespuestaInvalida(200)
  return { exitoso: true, datos: medios }
}
