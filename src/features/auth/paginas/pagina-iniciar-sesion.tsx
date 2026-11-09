import { Navigate, useLocation } from 'react-router'
import { IniciarSesion } from '@/features/auth/components/iniciar-sesion'
import { MENSAJE_SESION_VENCIDA } from '@/features/auth/config/reglas-inicio-sesion'
import { useIniciarSesion } from '@/features/auth/hooks/use-iniciar-sesion'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import {
  llegoPorSesionVencida,
  obtenerDestinoTrasIngresar,
} from '@/features/auth/utils/estado-redireccion'

export function PaginaIniciarSesion() {
  const { sesion } = useSesion()
  const { state: estadoRedireccion } = useLocation()
  const propiedadesInicioSesion = useIniciarSesion(
    llegoPorSesionVencida(estadoRedireccion) ? MENSAJE_SESION_VENCIDA : null,
  )

  // Con sesion no hay nada que hacer aca: se vuelve a la ruta pedida (o a la raiz). Es la misma salida
  // al ingresar y al abrir /iniciar-sesion ya logueado. replace: el boton atras no debe volver al login
  if (sesion !== null) {
    return <Navigate to={obtenerDestinoTrasIngresar(estadoRedireccion)} replace />
  }

  return <IniciarSesion {...propiedadesInicioSesion} />
}
