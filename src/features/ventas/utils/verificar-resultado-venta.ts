import { MARGEN_VERIFICACION_MILISEGUNDOS } from '@/features/ventas/config/reglas-venta'
import type { VentaDetalleApi } from '@/features/ventas/types/api-ventas'

// Cuando el resultado de una anulacion es incierto (sin red, tiempo agotado, 5xx, respuesta
// ilegible) o el back responde 409, se consulta el detalle de la venta para saber que paso de verdad.
// Se compara contra lo que se envio: asi un 409 que es la repeticion de una accion que si se guardo
// no se muestra como error.

/** Lo que se envio al anular, para reconocer la propia anulacion en el detalle. */
export interface EnvioAnulacion {
  /** Texto exacto enviado como motivo. */
  motivo: string
  idUsuario: number
  /** Hora del servidor (estimada) en que salio el pedido, en milisegundos. */
  enviadoEnMilisegundos: number
}

export type VerificacionAnulacion =
  /** La venta quedo anulada por este usuario con este motivo: la accion se aplico. */
  | { tipo: 'aplicada'; huboCobro: boolean }
  /** Ya estaba anulada por otra persona (u otro pedido). */
  | { tipo: 'anulada-por-otro'; nombreUsuario: string | null }
  /** Sigue sin anular; `ventanaVencida` dice si el servidor ya no la deja anular por el plazo. */
  | { tipo: 'no-aplicada'; ventanaVencida: boolean }

/**
 * Decide que paso con una anulacion a partir del detalle de la venta.
 * @param ahoraServidorMilisegundos Hora del servidor al responder el detalle.
 */
export function verificarAnulacionAplicada(
  venta: VentaDetalleApi,
  envio: EnvioAnulacion,
  ahoraServidorMilisegundos: number,
): VerificacionAnulacion {
  if (venta.estado !== 'ANULADA') {
    const limite = venta.fechaHoraLimiteModificacion
    return {
      tipo: 'no-aplicada',
      ventanaVencida: limite !== null && Date.parse(limite) <= ahoraServidorMilisegundos,
    }
  }
  const { anulacion } = venta
  const esPropia =
    anulacion !== null &&
    anulacion.motivo === envio.motivo &&
    anulacion.usuario.idUsuario === envio.idUsuario &&
    Date.parse(anulacion.fechaHora) >= envio.enviadoEnMilisegundos - MARGEN_VERIFICACION_MILISEGUNDOS
  if (esPropia) return { tipo: 'aplicada', huboCobro: venta.pagos.length > 0 }
  return { tipo: 'anulada-por-otro', nombreUsuario: anulacion?.usuario.nombre ?? null }
}
