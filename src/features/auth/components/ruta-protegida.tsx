import { Navigate, Outlet, useLocation } from 'react-router'
import { RUTA_INICIAR_SESION } from '@/features/auth/config/rutas-auth'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { construirEstadoRedireccion } from '@/features/auth/utils/estado-redireccion'

/**
 * Guard de las rutas internas: sin sesion valida redirige a /iniciar-sesion recordando la ruta pedida.
 * Es el unico lugar que redirige al login, tanto al cerrar la sesion como al vencer: asi no compiten
 * dos redirecciones y el cierre voluntario nunca arrastra la ruta de quien lo hizo.
 * Pendiente: leer `handle.rolesPermitidos` de las rutas activas (useMatches) para mostrar un acceso
 * denegado cuando el rol del usuario no este permitido. La Demo no tiene pantallas exclusivas de un rol.
 */
export function RutaProtegida() {
  const { sesion, motivoCierre } = useSesion()
  const ubicacion = useLocation()

  if (sesion === null) {
    return (
      <Navigate
        to={RUTA_INICIAR_SESION}
        replace
        state={construirEstadoRedireccion(motivoCierre, ubicacion)}
      />
    )
  }

  return <Outlet />
}
