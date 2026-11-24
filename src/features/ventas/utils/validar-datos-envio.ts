import {
  DESTINATARIO_ENVIO_LONGITUD_MAXIMA,
  DIRECCION_ENVIO_LONGITUD_MAXIMA,
} from '@/features/ventas/config/reglas-venta'
import type { ErroresDatosEnvio, TipoEntrega } from '@/features/ventas/types/venta'

export const MENSAJE_DIRECCION_ENVIO_OBLIGATORIA = 'Ingresá la dirección de envío.'
export const MENSAJE_DIRECCION_ENVIO_LARGA = `La dirección admite hasta ${DIRECCION_ENVIO_LONGITUD_MAXIMA} caracteres.`
export const MENSAJE_DESTINATARIO_ENVIO_LARGO = `El destinatario admite hasta ${DESTINATARIO_ENVIO_LONGITUD_MAXIMA} caracteres.`

/**
 * Valida los datos del envio con las mismas reglas del back. Con Retiro no hay nada que validar: los campos no
 * se muestran ni se envian. La direccion es obligatoria con Envio; el destinatario es opcional, pero si se escribe
 * no puede pasar el limite. Los textos se miden sin los espacios de los extremos, igual que el back.
 * Los mensajes son fijos: nunca repiten lo que escribio el vendedor (son datos personales).
 */
export function validarDatosEnvio(
  tipoEntrega: TipoEntrega,
  direccionEnvio: string,
  destinatarioEnvio: string,
): ErroresDatosEnvio {
  if (tipoEntrega === 'retiro') return {}

  const direccion = direccionEnvio.trim()
  const destinatario = destinatarioEnvio.trim()
  const errorDireccion =
    direccion === ''
      ? MENSAJE_DIRECCION_ENVIO_OBLIGATORIA
      : direccion.length > DIRECCION_ENVIO_LONGITUD_MAXIMA
        ? MENSAJE_DIRECCION_ENVIO_LARGA
        : undefined
  const errorDestinatario =
    destinatario.length > DESTINATARIO_ENVIO_LONGITUD_MAXIMA ? MENSAJE_DESTINATARIO_ENVIO_LARGO : undefined

  return {
    ...(errorDireccion !== undefined && { direccionEnvio: errorDireccion }),
    ...(errorDestinatario !== undefined && { destinatarioEnvio: errorDestinatario }),
  }
}

/** true si no hay ningun error. */
export function sinErroresDatosEnvio(errores: ErroresDatosEnvio) {
  return errores.direccionEnvio === undefined && errores.destinatarioEnvio === undefined
}
