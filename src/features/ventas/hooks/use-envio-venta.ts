import { useEffect, useRef, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { registrarVentaApi } from '@/features/ventas/api/registrar-venta-api'
import type { EstadoEnvioVenta } from '@/features/ventas/types/envio-venta'
import type { SolicitudVenta } from '@/features/ventas/types/solicitud-venta'
import type { ArticuloCarrito } from '@/features/ventas/types/venta'
import { traducirErrorRegistroVenta } from '@/features/ventas/utils/traducir-error-venta'

const MILISEGUNDOS_POR_SEGUNDO = 1000

/** Lo que necesita el hook de envio de la venta. */
interface OpcionesEnvioVenta {
  /** Para mostrar el nombre del producto cuando el back informa falta de stock. */
  articulos: ArticuloCarrito[]
  /** Se llama cuando un rechazo sugiere que catalogo o medios cambiaron en el back. */
  alNecesitarRecargarDatos: () => void
}

/**
 * Envia la venta al back una sola vez y lleva el estado del envio. Una vez que el POST esta en camino, la
 * venta quedo registrada o su resultado es incierto, no se puede volver a enviar: solo un rechazo del back
 * (nada se guardo) deja reintentar. El bloqueo usa un ref porque un segundo toque puede llegar antes del
 * siguiente render.
 */
export function useEnvioVenta({ articulos, alNecesitarRecargarDatos }: OpcionesEnvioVenta) {
  const { cliente } = useSesion()

  // --- ESTADOS ---
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvioVenta>({ fase: 'inactivo' })
  const envioBloqueadoRef = useRef(false)
  const inicioEnvioRef = useRef(0)

  // --- EFECTOS ---
  // Cuenta los segundos del envio para la barra de progreso. Se calcula contra la hora de inicio y no
  // sumando de a uno: con la pantalla apagada el navegador demora los temporizadores
  const enviando = estadoEnvio.fase === 'enviando'
  useEffect(() => {
    if (!enviando) return
    const intervalo = setInterval(() => {
      const segundos = Math.floor((Date.now() - inicioEnvioRef.current) / MILISEGUNDOS_POR_SEGUNDO)
      setEstadoEnvio((actual) =>
        actual.fase === 'enviando' ? { ...actual, segundosTranscurridos: segundos } : actual,
      )
    }, MILISEGUNDOS_POR_SEGUNDO)
    return () => clearInterval(intervalo)
  }, [enviando])

  // --- ACCIONES ---
  const enviarVenta = async (solicitud: SolicitudVenta) => {
    if (envioBloqueadoRef.current) return
    envioBloqueadoRef.current = true
    inicioEnvioRef.current = Date.now()
    setEstadoEnvio({ fase: 'enviando', segundosTranscurridos: 0 })

    const resultado = await registrarVentaApi(cliente, solicitud)

    if (resultado.exitoso) {
      // El bloqueo se mantiene: la venta ya existe
      setEstadoEnvio({ fase: 'registrada', registro: resultado.datos })
      return
    }

    const traduccion = traducirErrorRegistroVenta(resultado.error, articulos)
    if (traduccion.incierto && traduccion.mensaje !== null) {
      // El bloqueo se mantiene: la venta pudo haberse guardado
      setEstadoEnvio({ fase: 'resultado-incierto', mensaje: traduccion.mensaje })
      return
    }

    // El back rechazo el pedido sin guardar nada: se libera para corregir y reintentar
    envioBloqueadoRef.current = false
    setEstadoEnvio(
      traduccion.mensaje === null
        ? { fase: 'inactivo' }
        : { fase: 'rechazado', mensaje: traduccion.mensaje },
    )
    if (traduccion.recargarDatos) alNecesitarRecargarDatos()
    return
  }

  const descartarRechazo = () =>
    setEstadoEnvio((actual) => (actual.fase === 'rechazado' ? { fase: 'inactivo' } : actual))

  return { estadoEnvio, enviarVenta, descartarRechazo }
}
