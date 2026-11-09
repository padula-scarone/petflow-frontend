import { esObjeto } from '@/lib/es-objeto'
import { RUTA_INICIAR_SESION } from '@/features/auth/config/rutas-auth'
import type { EstadoRedireccionSesion, MotivoCierreSesion } from '@/features/auth/types/sesion'
import { RUTA_RAIZ } from '@/features/navegacion/config/rutas'

/** Parte de `useLocation()` que hace falta para recordar la ruta pedida. */
interface UbicacionRuta {
  pathname: string
  search: string
  hash: string
}

/**
 * Estado que lleva el redireccionamiento a /iniciar-sesion. El cierre voluntario no recuerda nada:
 * despues de cerrar la sesion puede entrar otra persona.
 */
export function construirEstadoRedireccion(
  motivoCierre: MotivoCierreSesion | null,
  ubicacion: UbicacionRuta,
): EstadoRedireccionSesion | undefined {
  if (motivoCierre === 'voluntario') return undefined
  const desde = `${ubicacion.pathname}${ubicacion.search}${ubicacion.hash}`
  return motivoCierre === 'vencida' ? { desde, motivo: 'vencida' } : { desde }
}

/** true si la redireccion llego por una sesion vencida (para mostrar el aviso). */
export function llegoPorSesionVencida(estado: unknown): boolean {
  return esObjeto(estado) && estado.motivo === 'vencida'
}

/**
 * Ruta a la que se vuelve tras ingresar: la que se pedia, o la raiz si no habia ninguna.
 * Solo acepta rutas internas: debe empezar con una sola barra y no ser el propio login.
 */
export function obtenerDestinoTrasIngresar(estado: unknown): string {
  const desde = esObjeto(estado) ? estado.desde : undefined
  const esRutaInterna = typeof desde === 'string' && desde.startsWith('/') && !desde.startsWith('//')
  const esElLogin = typeof desde === 'string' && desde.startsWith(RUTA_INICIAR_SESION)
  return esRutaInterna && !esElLogin ? desde : RUTA_RAIZ
}
