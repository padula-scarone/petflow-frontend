import type { ErrorApi } from '@/lib/cliente-http.types'
import type { ErroresDatosEnvio } from '@/features/ventas/types/venta'

/**
 * Los errores del 400 del back que corresponden a los datos del envio, segun el campo (`path`) que informa.
 * Devuelve null si el 400 no trae ninguno de los dos campos. El texto es el del back, que es fijo y nunca repite
 * lo recibido. Lo que no es un texto del back para esos campos se descarta.
 */
export function extraerErroresDatosEnvio(error: ErrorApi): ErroresDatosEnvio | null {
  const direccion = error.errores.find((errorCampo) => errorCampo.campo === 'direccionEnvio')
  const destinatario = error.errores.find((errorCampo) => errorCampo.campo === 'destinatarioEnvio')
  if (direccion === undefined && destinatario === undefined) return null

  return {
    ...(direccion !== undefined && { direccionEnvio: direccion.mensaje }),
    ...(destinatario !== undefined && { destinatarioEnvio: destinatario.mensaje }),
  }
}
