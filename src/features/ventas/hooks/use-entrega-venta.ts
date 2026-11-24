import { useState } from 'react'
import type { ErroresDatosEnvio, PropiedadesEntrega, TipoEntrega } from '@/features/ventas/types/venta'
import { sinErroresDatosEnvio, validarDatosEnvio } from '@/features/ventas/utils/validar-datos-envio'

/**
 * Entrega de la venta en curso: Retiro o Envio y, con Envio, la direccion y el destinatario. Se define en el cobro,
 * al final de la charla con el cliente. Vive en el contexto de Registrar Venta, asi sobrevive a la navegacion entre
 * pantallas. Los datos del envio son personales: nunca se escriben en un log ni en un mensaje.
 * @param tipoEntregaInicial Lo que trae una venta editada; sin ella, Retiro.
 */
export function useEntregaVenta(tipoEntregaInicial: TipoEntrega) {
  // --- ESTADOS ---
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>(tipoEntregaInicial)
  const [direccionEnvio, setDireccionEnvio] = useState('')
  const [destinatarioEnvio, setDestinatarioEnvio] = useState('')
  // Hasta el primer intento de confirmar no se marca "obligatorio" en un campo que el vendedor todavia no toco
  const [validacionIntentada, setValidacionIntentada] = useState(false)
  // Lo que rechazo el back (400): se muestra en el campo hasta que el vendedor lo edite
  const [erroresDelBack, setErroresDelBack] = useState<ErroresDatosEnvio>({})
  // Sube con cada intento fallido: la vista lleva el foco al primer campo con error, aunque ya estuviera marcado
  const [intentosFallidos, setIntentosFallidos] = useState(0)

  // --- CALCULOS ---
  const erroresValidacion = validacionIntentada
    ? validarDatosEnvio(tipoEntrega, direccionEnvio, destinatarioEnvio)
    : {}
  // El error del back manda sobre el de la validacion local: es el ultimo que vio el vendedor
  const erroresDatosEnvio: ErroresDatosEnvio = {
    direccionEnvio: erroresDelBack.direccionEnvio ?? erroresValidacion.direccionEnvio,
    destinatarioEnvio: erroresDelBack.destinatarioEnvio ?? erroresValidacion.destinatarioEnvio,
  }

  // --- ACCIONES ---
  // Con Retiro el back rechaza estos campos (400): al cambiar a Retiro se descartan, con sus errores
  const cambiarEntrega = (nuevaEntrega: TipoEntrega) => {
    setTipoEntrega(nuevaEntrega)
    if (nuevaEntrega === 'retiro') {
      setDireccionEnvio('')
      setDestinatarioEnvio('')
      setValidacionIntentada(false)
      setErroresDelBack({})
    }
  }

  // Al editar un campo se descarta el error que habia puesto el back: ya no corresponde a lo escrito
  const cambiarDireccionEnvio = (texto: string) => {
    setDireccionEnvio(texto)
    setErroresDelBack((actuales) => ({ ...actuales, direccionEnvio: undefined }))
  }
  const cambiarDestinatarioEnvio = (texto: string) => {
    setDestinatarioEnvio(texto)
    setErroresDelBack((actuales) => ({ ...actuales, destinatarioEnvio: undefined }))
  }

  /** Valida antes de confirmar. Devuelve true si se puede seguir; false si hay algo que corregir (queda marcado). */
  const validarDatosDelEnvio = () => {
    setValidacionIntentada(true)
    const sinErrores = sinErroresDatosEnvio(validarDatosEnvio(tipoEntrega, direccionEnvio, destinatarioEnvio))
    if (!sinErrores) setIntentosFallidos((actuales) => actuales + 1)
    return sinErrores
  }

  const propiedadesEntrega: PropiedadesEntrega = {
    tipoEntrega,
    direccionEnvio,
    destinatarioEnvio,
    erroresDatosEnvio,
    intentosFallidos,
    onCambiarEntrega: cambiarEntrega,
    onCambiarDireccionEnvio: cambiarDireccionEnvio,
    onCambiarDestinatarioEnvio: cambiarDestinatarioEnvio,
  }

  return {
    tipoEntrega,
    direccionEnvio,
    destinatarioEnvio,
    propiedadesEntrega,
    validarDatosDelEnvio,
    /** Muestra en los campos lo que el back rechazo del envio. */
    mostrarErroresDelBack: setErroresDelBack,
  }
}
