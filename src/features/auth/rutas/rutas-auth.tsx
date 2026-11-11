import type { RouteObject } from 'react-router'
import { RUTA_INICIAR_SESION } from '@/features/auth/config/rutas-auth'
import { PaginaIniciarSesion } from '@/features/auth/paginas/pagina-iniciar-sesion'

/** Rutas publicas de autenticacion. */
export const RUTAS_AUTH: RouteObject[] = [
  { path: RUTA_INICIAR_SESION, element: <PaginaIniciarSesion /> },
]
