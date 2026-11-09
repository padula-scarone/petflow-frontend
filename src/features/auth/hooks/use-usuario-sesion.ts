import { useSesion } from '@/features/auth/hooks/use-sesion'
import type { UsuarioSesion } from '@/features/auth/types/api-auth'

/**
 * Usuario de la sesion actual. Solo para pantallas dentro de RutaProtegida, donde siempre hay
 * sesion; fuera de ellas falla en lugar de devolver un usuario inventado.
 */
export function useUsuarioSesion(): UsuarioSesion {
  const { sesion } = useSesion()
  if (sesion === null) throw new Error('useUsuarioSesion se uso sin una sesion iniciada')
  return sesion.usuario
}
