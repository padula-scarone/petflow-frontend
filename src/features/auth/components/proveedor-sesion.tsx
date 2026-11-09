import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ContextoDeSesion } from '@/features/auth/context/contexto-de-sesion'
import type { MotivoCierreSesion, Sesion } from '@/features/auth/types/sesion'
import {
  borrarSesionGuardada,
  CLAVE_ALMACENAMIENTO_SESION,
  guardarSesion,
  leerSesionGuardada,
} from '@/features/auth/utils/almacenamiento-sesion'
import { crearClienteHttp } from '@/lib/cliente-http'
import { URL_API } from '@/lib/entorno'

/** Estado de la sesion: quien esta adentro y, si no hay nadie, por que. */
interface EstadoSesion {
  sesion: Sesion | null
  motivoCierre: MotivoCierreSesion | null
}

/** Props del proveedor de sesion. */
interface ProveedorSesionProps {
  children: ReactNode
}

/**
 * Dueno de la sesion: la lee al arrancar, la guarda, la cierra al vencer y crea el cliente HTTP.
 * Se monta por encima del router; el guard y las pantallas la leen con useSesion.
 */
export function ProveedorSesion({ children }: ProveedorSesionProps) {
  // --- ESTADOS ---
  // La lectura es sincrona y ocurre antes del primer render: el guard no ve un parpadeo sin sesion.
  const [estado, setEstado] = useState<EstadoSesion>(() => {
    const lectura = leerSesionGuardada(Date.now())
    return { sesion: lectura.sesion, motivoCierre: lectura.vencida ? 'vencida' : null }
  })

  // --- PERSISTENCIA ---
  // El almacenamiento refleja el estado: guardar al ingresar, borrar al quedar sin sesion.
  useEffect(() => {
    if (estado.sesion === null) borrarSesionGuardada()
    else guardarSesion(estado.sesion)
  }, [estado.sesion])

  // --- CLIENTE HTTP ---
  // Se recrea solo cuando cambia el token (al ingresar y al salir); no hay refresh token.
  const token = estado.sesion?.token ?? null
  const cliente = useMemo(
    () =>
      crearClienteHttp({
        urlBase: URL_API,
        obtenerToken: () => token,
        // Un 401 tardio de una peticion hecha con otro token no debe cerrar la sesion nueva:
        // solo cierra si el token rechazado sigue siendo el de la sesion vigente
        alRechazarSesion: (tokenUsado) =>
          setEstado((actual) =>
            actual.sesion?.token === tokenUsado ? { sesion: null, motivoCierre: 'vencida' } : actual,
          ),
      }),
    [token],
  )

  // --- ACCIONES ---
  const iniciarSesion = useCallback((sesion: Sesion) => {
    setEstado({ sesion, motivoCierre: null })
  }, [])

  const cerrarSesion = useCallback(() => {
    setEstado({ sesion: null, motivoCierre: 'voluntario' })
  }, [])

  // --- VENCIMIENTO ---
  // Cierra a la hora exacta. Se revisa tambien al volver a primer plano: con la pantalla apagada
  // el navegador demora los temporizadores. El back sigue siendo la autoridad final (401).
  const vencimiento = estado.sesion?.vencimiento ?? null
  useEffect(() => {
    if (vencimiento === null) return

    const cerrarPorVencimiento = () => setEstado({ sesion: null, motivoCierre: 'vencida' })
    const cerrarSiVencio = () => {
      if (Date.now() >= vencimiento) cerrarPorVencimiento()
    }
    const temporizador = setTimeout(cerrarPorVencimiento, Math.max(0, vencimiento - Date.now()))
    document.addEventListener('visibilitychange', cerrarSiVencio)
    return () => {
      clearTimeout(temporizador)
      document.removeEventListener('visibilitychange', cerrarSiVencio)
    }
  }, [vencimiento])

  // --- CIERRE EN OTRA VENTANA ---
  // Si otra ventana de la app cierra la sesion, esta tambien. Los ingresos de otra ventana no se
  // adoptan: cambiar de usuario con la pantalla abierta mezclaria lo que se ve con otro vendedor.
  useEffect(() => {
    const alCambiarAlmacenamiento = (evento: StorageEvent) => {
      // key null: se vacio todo el almacenamiento
      if (evento.key !== null && evento.key !== CLAVE_ALMACENAMIENTO_SESION) return
      if (leerSesionGuardada(Date.now()).sesion !== null) return
      setEstado((actual) =>
        actual.sesion === null ? actual : { sesion: null, motivoCierre: 'voluntario' },
      )
    }
    window.addEventListener('storage', alCambiarAlmacenamiento)
    return () => window.removeEventListener('storage', alCambiarAlmacenamiento)
  }, [])

  const valorContexto = useMemo(
    () => ({
      sesion: estado.sesion,
      motivoCierre: estado.motivoCierre,
      cliente,
      iniciarSesion,
      cerrarSesion,
    }),
    [estado, cliente, iniciarSesion, cerrarSesion],
  )

  return <ContextoDeSesion value={valorContexto}>{children}</ContextoDeSesion>
}
