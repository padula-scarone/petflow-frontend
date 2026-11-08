import { Outlet } from 'react-router'

/**
 * Guard de las rutas internas. Hoy solo renderiza el Outlet.
 * Lo resuelve la accion Iniciar Sesion (CUB 6.1): leera la sesion y, si no hay, redirigira a
 * /iniciar-sesion; y leera `handle.rolesPermitidos` de las rutas activas (useMatches) para
 * mostrar un acceso denegado cuando el rol del usuario no este permitido.
 */
export function RutaProtegida() {
  return <Outlet />
}
