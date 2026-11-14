import { useRef, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { useUsuarioSesion } from '@/features/auth/hooks/use-usuario-sesion'
import { registrarCambioApi } from '@/features/ventas/cambios-mercaderia/api/registrar-cambio-api'
import { verificarAltaGuardada } from '@/features/ventas/cambios-mercaderia/api/verificar-alta-cambio-api'
import {
  MENSAJE_ALTA_CAMBIO_INCIERTA,
  MENSAJE_ALTA_CAMBIO_NO_GUARDADO,
  MENSAJE_ALTA_CAMBIO_SIN_VERIFICAR,
} from '@/features/ventas/cambios-mercaderia/config/mensajes-error-cambio'
import type { RegistrarCambioRequest } from '@/features/ventas/cambios-mercaderia/types/api-cambios'
import type {
  CambioMercaderiaDetalle,
  ErrorAccionCambio,
  EstadoEnvioCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import {
  crearErrorAccionCambio,
  traducirRechazoAltaCambio,
} from '@/features/ventas/cambios-mercaderia/utils/traducir-error-cambio'
import type { EnvioAltaCambio } from '@/features/ventas/cambios-mercaderia/utils/verificar-resultado-cambio'
import { clasificarFalloAccion } from '@/features/ventas/utils/traducir-error-accion-venta'

const SIN_REFERENCIA = { estadoHttp: null, codigo: null } as const

/** Lo que necesita el hook de envio del cambio. */
interface OpcionesEnvioCambio {
  /** Hora del servidor menos hora local, para estimar cuando salio el pedido. */
  desfaseServidorMilisegundos: number
  /** El cambio quedo guardado (confirmado por el back o verificado despues de un resultado incierto). */
  alRegistrar: (cambio: CambioMercaderiaDetalle) => void
  /** El back rechazo el alta: sirve para volver a pedir catalogo o medios si cambiaron. */
  alRechazar: (error: ErrorAccionCambio) => void
}

/**
 * Envia el cambio al back una sola vez y lleva el estado del envio. Una vez que el POST esta en camino, el
 * cambio quedo registrado o su resultado es incierto, no se puede volver a enviar: solo un rechazo del back
 * (nada se guardo) o una verificacion que confirma que no se guardo dejan reintentar. El back no tiene clave de
 * idempotencia, asi que un resultado incierto se resuelve consultando la lista, no reenviando. El bloqueo usa
 * un ref porque un segundo toque puede llegar antes del siguiente render.
 */
export function useEnvioCambio({ desfaseServidorMilisegundos, alRegistrar, alRechazar }: OpcionesEnvioCambio) {
  const { cliente } = useSesion()
  const usuario = useUsuarioSesion()

  // --- ESTADOS ---
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvioCambio>({ tipo: 'inactivo' })
  const envioBloqueadoRef = useRef(false)
  /** Lo ultimo enviado, para reconocer el cambio al verificar. */
  const ultimoEnvioRef = useRef<EnvioAltaCambio | null>(null)

  // --- ACCIONES ---
  const registrarGuardado = (cambio: CambioMercaderiaDetalle) => {
    // El bloqueo se mantiene: el cambio ya existe
    setEstadoEnvio({ tipo: 'exito', cambio })
    alRegistrar(cambio)
  }

  /** Consulta la lista para saber si un alta incierta se guardo. */
  const verificar = async () => {
    const envio = ultimoEnvioRef.current
    if (envio === null) return
    setEstadoEnvio({ tipo: 'incierto', mensaje: MENSAJE_ALTA_CAMBIO_INCIERTA, verificando: true })

    const verificacion = await verificarAltaGuardada(cliente, envio, Date.now() + desfaseServidorMilisegundos)
    if (verificacion.tipo === 'guardado') return registrarGuardado(verificacion.cambio)
    if (verificacion.tipo === 'no-guardado') {
      // Se leyo la lista completa y no esta: nada se guardo, se puede confirmar de nuevo
      envioBloqueadoRef.current = false
      setEstadoEnvio({
        tipo: 'error',
        error: crearErrorAccionCambio(SIN_REFERENCIA, MENSAJE_ALTA_CAMBIO_NO_GUARDADO),
      })
      return
    }
    // No se puede afirmar nada: el envio sigue bloqueado y se pide revisar la lista
    setEstadoEnvio({ tipo: 'incierto', mensaje: MENSAJE_ALTA_CAMBIO_SIN_VERIFICAR, verificando: false })
  }

  const enviarCambio = async (cuerpo: RegistrarCambioRequest, saldoEsperadoCentavos: number) => {
    if (envioBloqueadoRef.current) return
    envioBloqueadoRef.current = true
    ultimoEnvioRef.current = {
      cuerpo,
      saldoEsperadoCentavos,
      idUsuario: usuario.idUsuario,
      enviadoEnMilisegundos: Date.now() + desfaseServidorMilisegundos,
    }
    setEstadoEnvio({ tipo: 'enviando' })

    const respuesta = await registrarCambioApi(cliente, cuerpo)
    if (respuesta.exitoso) return registrarGuardado(respuesta.datos.cambio)

    const clasificacion = clasificarFalloAccion(respuesta.error)
    // 401: el cliente HTTP ya cerro la sesion; la pantalla de login reemplaza a esta
    if (clasificacion === 'sin-sesion') {
      envioBloqueadoRef.current = false
      setEstadoEnvio({ tipo: 'inactivo' })
      return
    }
    if (clasificacion === 'rechazo') {
      // El back rechazo el pedido sin guardar nada: se libera para corregir y reintentar
      const error = traducirRechazoAltaCambio(respuesta.error)
      envioBloqueadoRef.current = false
      setEstadoEnvio({ tipo: 'error', error })
      alRechazar(error)
      return
    }
    // Sin red, tiempo agotado, 5xx o respuesta ilegible: el cambio pudo haberse guardado. El bloqueo se
    // mantiene y se verifica de inmediato, sin reenviar
    await verificar()
  }

  /** Cualquier cambio en lo cargado descarta un rechazo anterior del servidor: ya no corresponde. */
  const descartarRechazo = () =>
    setEstadoEnvio((actual) => (actual.tipo === 'error' ? { tipo: 'inactivo' } : actual))

  /** Vuelve al estado inicial para cargar otro cambio. */
  const reiniciar = () => {
    envioBloqueadoRef.current = false
    ultimoEnvioRef.current = null
    setEstadoEnvio({ tipo: 'inactivo' })
  }

  return { estadoEnvio, enviarCambio, verificar, descartarRechazo, reiniciar }
}
