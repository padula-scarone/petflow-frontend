import { useEffect, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { consultarVentaApi, type DetalleVentaConsultado } from '@/features/ventas/api/consultar-venta-api'
import { convertirDetalleApiAComprobante } from '@/features/ventas/api/convertir-detalle-api-a-comprobante'
import { MENSAJE_COMPROBANTE_ILEGIBLE } from '@/features/ventas/config/mensajes-error-venta'
import { usePlazoModificacionVenta } from '@/features/ventas/hooks/use-plazo-modificacion-venta'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type { EstadoComprobanteVenta } from '@/features/ventas/types/comprobante'
import type { RegistroVenta } from '@/features/ventas/types/registro-venta'
import {
  construirEnlaceMail,
  construirEnlaceWhatsApp,
} from '@/features/ventas/utils/construir-enlaces-comprobante'
import { traducirErrorConsulta } from '@/features/ventas/utils/traducir-error-venta'
import type { ResultadoApi } from '@/lib/cliente-http.types'

interface CargaDetalle {
  idVenta: string
  intento: number
  resultado: ResultadoApi<DetalleVentaConsultado>
}

/**
 * Arma el Comprobante con lo que guardo el servidor (GET /api/ventas/:idVenta) una vez que la venta esta
 * registrada, y construye los enlaces de WhatsApp y Mail. Si el pedido falla, la venta igual existe: el
 * reintento repite solo este pedido.
 * @param registro La venta confirmada por el back; null mientras no hay ninguna.
 * @param medios Medios de pago cargados: sirven para saber si un pago admite vuelto.
 */
export function useComprobanteVenta(registro: RegistroVenta | null, medios: MedioPago[]) {
  const { cliente } = useSesion()

  // --- ESTADOS ---
  const [numeroIntento, setNumeroIntento] = useState(0)
  const [carga, setCarga] = useState<CargaDetalle | null>(null)

  // --- EFECTOS ---
  const idVenta = registro?.idVenta ?? null
  useEffect(() => {
    if (idVenta === null) return
    let vigente = true
    void consultarVentaApi(cliente, idVenta).then((resultado) => {
      if (vigente) setCarga({ idVenta, intento: numeroIntento, resultado })
    })
    return () => {
      vigente = false
    }
  }, [cliente, idVenta, numeroIntento])

  // --- CALCULOS ---
  // Solo cuenta la respuesta de esta venta y de este intento: un reintento vuelve a "cargando"
  const cargaVigente =
    registro !== null &&
    carga !== null &&
    carga.idVenta === registro.idVenta &&
    carga.intento === numeroIntento
      ? carga
      : null
  const detalle =
    cargaVigente !== null && cargaVigente.resultado.exitoso ? cargaVigente.resultado.datos : null
  const fechaHoraLimiteEdicion = detalle?.venta.fechaHoraLimiteModificacion ?? null
  // El reloj del plazo se corrige con la hora del servidor, no con la del dispositivo
  const ahoraServidorMilisegundos = usePlazoModificacionVenta(
    [fechaHoraLimiteEdicion],
    detalle?.desfaseServidorMilisegundos ?? 0,
  )

  const calcularEstadoComprobante = (): EstadoComprobanteVenta | null => {
    if (registro === null) return null
    if (cargaVigente === null) return { fase: 'cargando', registro }
    if (!cargaVigente.resultado.exitoso) {
      return {
        fase: 'error',
        registro,
        mensaje: traducirErrorConsulta(
          cargaVigente.resultado.error,
          'el comprobante',
          'ver el comprobante',
        ),
      }
    }
    const comprobante = convertirDetalleApiAComprobante(cargaVigente.resultado.datos.venta, medios)
    if (comprobante === null || fechaHoraLimiteEdicion === null) {
      return { fase: 'error', registro, mensaje: MENSAJE_COMPROBANTE_ILEGIBLE }
    }
    return {
      fase: 'listo',
      comprobante,
      enlaceWhatsApp: construirEnlaceWhatsApp(comprobante),
      enlaceMail: construirEnlaceMail(comprobante),
      edicionDisponible: Date.parse(fechaHoraLimiteEdicion) > ahoraServidorMilisegundos,
      fechaHoraLimiteEdicion,
    }
  }

  return {
    estadoComprobante: calcularEstadoComprobante(),
    reintentarComprobante: () => setNumeroIntento((actual) => actual + 1),
  }
}
