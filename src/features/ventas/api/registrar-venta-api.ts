import { esObjeto } from '@/lib/es-objeto'
import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import { crearFalloRespuestaInvalida } from '@/features/ventas/api/crear-fallo-respuesta-invalida'
import { convertirTextoACentavos } from '@/features/ventas/api/conversores-numericos'
import {
  convertirCanalAOrigen,
  convertirEntregaAModalidad,
  convertirEstadoApiAEstado,
  esEstadoVentaApi,
} from '@/features/ventas/api/conversores-enums'
import type {
  PagoRegistradoApi,
  RegistrarVentaRequest,
  RegistrarVentaResponse,
} from '@/features/ventas/types/api-ventas'
import type { RegistroVenta } from '@/features/ventas/types/registro-venta'
import type { SolicitudVenta } from '@/features/ventas/types/solicitud-venta'
import { convertirCentavosAPesos } from '@/features/ventas/utils/calcular-centavos'

const RUTA_REGISTRAR_VENTA_API = '/api/ventas'
const ESTADO_CREADO = 201

/**
 * Arma el body del alta. Aca se convierten los ids a numero, los enums a MAYUSCULAS y los centavos a pesos.
 * Omite los campos que el back prohibe sin su pareja: motivo sin descuento, monto recibido sin efectivo.
 */
export function convertirSolicitudACuerpo(solicitud: SolicitudVenta): RegistrarVentaRequest {
  return {
    origen: convertirCanalAOrigen(solicitud.canalVenta),
    modalidadEntrega: convertirEntregaAModalidad(solicitud.tipoEntrega),
    items: solicitud.items.map((item) => ({
      idProducto: Number(item.idProducto),
      cantidad: item.cantidad,
    })),
    pagos: solicitud.pagos.map((pago) => ({
      idMedioPago: pago.idMedioPago,
      monto: convertirCentavosAPesos(pago.montoBaseCentavos),
      ...(pago.montoRecibidoCentavos !== null && {
        montoRecibido: convertirCentavosAPesos(pago.montoRecibidoCentavos),
      }),
    })),
    ...(solicitud.descuentoManual !== null && {
      descuentoManual: convertirCentavosAPesos(solicitud.descuentoManual.montoCentavos),
      motivoDescuento: solicitud.descuentoManual.motivo,
    }),
    ...(solicitud.clienteReferencia !== null && { clienteReferencia: solicitud.clienteReferencia }),
  }
}

function esPagoRegistradoApi(valor: unknown): valor is PagoRegistradoApi {
  return (
    esObjeto(valor) &&
    typeof valor.idMedioPago === 'number' &&
    typeof valor.montoFinal === 'string' &&
    (valor.montoRecibido === null || typeof valor.montoRecibido === 'string') &&
    (valor.vuelto === null || typeof valor.vuelto === 'string')
  )
}

function esRegistrarVentaResponse(valor: unknown): valor is RegistrarVentaResponse {
  return (
    esObjeto(valor) &&
    esObjeto(valor.venta) &&
    typeof valor.venta.idVenta === 'number' &&
    typeof valor.venta.numeroComprobante === 'string' &&
    typeof valor.venta.montoTotal === 'string' &&
    esEstadoVentaApi(valor.venta.estado) &&
    typeof valor.venta.fechaHora === 'string' &&
    Array.isArray(valor.venta.pagos) &&
    valor.venta.pagos.every(esPagoRegistradoApi)
  )
}

/**
 * POST /api/ventas. Un 201 con una forma que no cumple el contrato se devuelve como fallo: la venta
 * pudo haberse guardado igual, asi que el llamador lo trata como resultado incierto, nunca como "no se guardo".
 */
export async function registrarVentaApi(
  cliente: ClienteHttp,
  solicitud: SolicitudVenta,
): Promise<ResultadoApi<RegistroVenta>> {
  const resultado = await cliente.solicitar<unknown>(RUTA_REGISTRAR_VENTA_API, {
    metodo: 'POST',
    cuerpo: convertirSolicitudACuerpo(solicitud),
  })
  if (!resultado.exitoso) return resultado
  if (!esRegistrarVentaResponse(resultado.datos)) return crearFalloRespuestaInvalida(ESTADO_CREADO)

  const { venta } = resultado.datos
  const montoTotalCentavos = convertirTextoACentavos(venta.montoTotal)
  if (montoTotalCentavos === null) return crearFalloRespuestaInvalida(ESTADO_CREADO)

  return {
    exitoso: true,
    datos: {
      idVenta: String(venta.idVenta),
      numeroComprobante: venta.numeroComprobante,
      montoTotal: convertirCentavosAPesos(montoTotalCentavos),
      estado: convertirEstadoApiAEstado(venta.estado),
      fechaHora: venta.fechaHora,
    },
  }
}
