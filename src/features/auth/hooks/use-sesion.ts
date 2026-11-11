import { useContext } from 'react'
import { ContextoDeSesion } from '@/features/auth/context/contexto-de-sesion'
import type { ContextoSesion } from '@/features/auth/types/sesion'

/** Lee la sesion, el cliente HTTP y las acciones de ingreso y cierre. */
export function useSesion(): ContextoSesion {
  const contexto = useContext(ContextoDeSesion)
  if (contexto === null) throw new Error('useSesion debe usarse dentro de ProveedorSesion')
  return contexto
}
