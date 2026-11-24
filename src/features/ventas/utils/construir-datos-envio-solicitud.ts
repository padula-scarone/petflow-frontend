import type { SolicitudVenta } from '@/features/ventas/types/solicitud-venta'
import type { TipoEntrega } from '@/features/ventas/types/venta'

/**
 * Los datos del envio que viajan en la solicitud. Con Retiro no viaja nada (el back responde 400 si llegan).
 * Con Envio la direccion va recortada, y el destinatario solo si se escribio algo: un destinatario vacio se omite,
 * porque el back tambien lo rechaza si llega vacio.
 */
export function construirDatosEnvioSolicitud(
  tipoEntrega: TipoEntrega,
  direccionEnvio: string,
  destinatarioEnvio: string,
): Pick<SolicitudVenta, 'direccionEnvio' | 'destinatarioEnvio'> {
  if (tipoEntrega === 'retiro') return {}

  const destinatario = destinatarioEnvio.trim()
  return {
    direccionEnvio: direccionEnvio.trim(),
    ...(destinatario !== '' && { destinatarioEnvio: destinatario }),
  }
}
