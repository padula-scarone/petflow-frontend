/** Un dato del envio listo para mostrar: su etiqueta y su valor. */
export interface DatoEnvio {
  etiqueta: string
  valor: string
}

/**
 * Los datos del envio que corresponde mostrar de una venta: solo si es de Envio, y solo los que tienen valor (un dato
 * null no deja una fila vacia). Con Retiro devuelve vacio aunque llegue algun valor. Es la unica regla para las
 * pantallas y para el texto del comprobante. Son datos personales: nunca van en un log.
 */
export function listarDatosEnvio(
  esEnvio: boolean,
  direccionEnvio: string | null,
  destinatarioEnvio: string | null,
): DatoEnvio[] {
  if (!esEnvio) return []

  return [
    ...(direccionEnvio !== null ? [{ etiqueta: 'Dirección de envío', valor: direccionEnvio }] : []),
    ...(destinatarioEnvio !== null ? [{ etiqueta: 'Destinatario', valor: destinatarioEnvio }] : []),
  ]
}
