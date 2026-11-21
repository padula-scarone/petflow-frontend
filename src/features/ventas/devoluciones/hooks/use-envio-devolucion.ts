import { useRef, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { useUsuarioSesion } from '@/features/auth/hooks/use-usuario-sesion'
import { registrarDevolucionApi } from '@/features/ventas/devoluciones/api/registrar-devolucion-api'
import { verificarAltaGuardada } from '@/features/ventas/devoluciones/api/verificar-alta-devolucion-api'
import {
  MENSAJE_ALTA_DEVOLUCION_INCIERTA,
  MENSAJE_ALTA_DEVOLUCION_NO_GUARDADA,
  MENSAJE_ALTA_DEVOLUCION_SIN_VERIFICAR,
} from '@/features/ventas/devoluciones/config/mensajes-error-devolucion'
import type { RegistrarDevolucionRequest } from '@/features/ventas/devoluciones/types/api-devoluciones'
import type {
  DevolucionDetalle,
  ErrorAccionDevolucion,
  EstadoEnvioDevolucion,
} from '@/features/ventas/devoluciones/types/devolucion'
import {
  crearErrorAccionDevolucion,
  traducirRechazoAltaDevolucion,
} from '@/features/ventas/devoluciones/utils/traducir-error-devolucion'
import type { EnvioAltaDevolucion } from '@/features/ventas/devoluciones/utils/verificar-resultado-devolucion'
import { clasificarFalloAccion } from '@/features/ventas/utils/traducir-error-accion-venta'

const SIN_REFERENCIA = { estadoHttp: null, codigo: null } as const

/** Lo que necesita el hook de envio de la devolución. */
interface OpcionesEnvioDevolucion {
  /** Hora del servidor menos hora local, para estimar cuando salio el pedido. */
  desfaseServidorMilisegundos: number
  /** La devolución quedo guardada (confirmado por el back o verificado despues de un resultado incierto). */
  alRegistrar: (devolucion: DevolucionDetalle) => void
  /** El back rechazo el alta: sirve para volver a pedir catalogo o medios si cambiaron. */
  alRechazar: (error: ErrorAccionDevolucion) => void
}

/**
 * Envia la devolución al back una sola vez y lleva el estado del envio. Una vez que el POST esta en camino, el
 * devolución quedo registrada o su resultado es incierto, no se puede volver a enviar: solo un rechazo del back
 * (nada se guardo) o una verificacion que confirma que no se guardo dejan reintentar. El back no tiene clave de
 * idempotencia, asi que un resultado incierto se resuelve consultando la lista, no reenviando. El bloqueo usa
 * un ref porque un segundo toque puede llegar antes del siguiente render.
 */
export function useEnvioDevolucion({ desfaseServidorMilisegundos, alRegistrar, alRechazar }: OpcionesEnvioDevolucion) {
  const { cliente } = useSesion()
  const usuario = useUsuarioSesion()

  // --- ESTADOS ---
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvioDevolucion>({ tipo: 'inactivo' })
  const envioBloqueadoRef = useRef(false)
  /** Lo ultimo enviado, para reconocer la devolución al verificar. */
  const ultimoEnvioRef = useRef<EnvioAltaDevolucion | null>(null)

  // --- ACCIONES ---
  const registrarGuardado = (devolucion: DevolucionDetalle) => {
    // El bloqueo se mantiene: la devolución ya existe
    setEstadoEnvio({ tipo: 'exito', devolucion })
    alRegistrar(devolucion)
  }

  /** Consulta la lista para saber si un alta incierta se guardo. */
  const verificar = async () => {
    const envio = ultimoEnvioRef.current
    if (envio === null) return
    setEstadoEnvio({ tipo: 'incierto', mensaje: MENSAJE_ALTA_DEVOLUCION_INCIERTA, verificando: true })

    const verificacion = await verificarAltaGuardada(cliente, envio, Date.now() + desfaseServidorMilisegundos)
    if (verificacion.tipo === 'guardado') return registrarGuardado(verificacion.devolucion)
    if (verificacion.tipo === 'no-guardado') {
      // Se leyo la lista completa y no esta: nada se guardo, se puede confirmar de nuevo
      envioBloqueadoRef.current = false
      setEstadoEnvio({
        tipo: 'error',
        error: crearErrorAccionDevolucion(SIN_REFERENCIA, MENSAJE_ALTA_DEVOLUCION_NO_GUARDADA),
      })
      return
    }
    // No se puede afirmar nada: el envio sigue bloqueado y se pide revisar la lista
    setEstadoEnvio({ tipo: 'incierto', mensaje: MENSAJE_ALTA_DEVOLUCION_SIN_VERIFICAR, verificando: false })
  }

  const enviarDevolucion = async (cuerpo: RegistrarDevolucionRequest, saldoEsperadoCentavos: number) => {
    if (envioBloqueadoRef.current) return
    envioBloqueadoRef.current = true
    ultimoEnvioRef.current = {
      cuerpo,
      saldoEsperadoCentavos,
      idUsuario: usuario.idUsuario,
      enviadoEnMilisegundos: Date.now() + desfaseServidorMilisegundos,
    }
    setEstadoEnvio({ tipo: 'enviando' })

    const respuesta = await registrarDevolucionApi(cliente, cuerpo)
    if (respuesta.exitoso) return registrarGuardado(respuesta.datos.devolucion)

    const clasificacion = clasificarFalloAccion(respuesta.error)
    // 401: el cliente HTTP ya cerro la sesion; la pantalla de login reemplaza a esta
    if (clasificacion === 'sin-sesion') {
      envioBloqueadoRef.current = false
      setEstadoEnvio({ tipo: 'inactivo' })
      return
    }
    if (clasificacion === 'rechazo') {
      // El back rechazo el pedido sin guardar nada: se libera para corregir y reintentar
      const error = traducirRechazoAltaDevolucion(respuesta.error)
      envioBloqueadoRef.current = false
      setEstadoEnvio({ tipo: 'error', error })
      alRechazar(error)
      return
    }
    // Sin red, tiempo agotado, 5xx o respuesta ilegible: la devolución pudo haberse guardado. El bloqueo se
    // mantiene y se verifica de inmediato, sin reenviar
    await verificar()
  }

  /** Cualquier devolución en lo cargado descarta un rechazo anterior del servidor: ya no corresponde. */
  const descartarRechazo = () =>
    setEstadoEnvio((actual) => (actual.tipo === 'error' ? { tipo: 'inactivo' } : actual))

  /** Vuelve al estado inicial para cargar otra devolución. */
  const reiniciar = () => {
    envioBloqueadoRef.current = false
    ultimoEnvioRef.current = null
    setEstadoEnvio({ tipo: 'inactivo' })
  }

  return { estadoEnvio, enviarDevolucion: enviarDevolucion, verificar, descartarRechazo, reiniciar }
}
