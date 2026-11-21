import type { RolUsuario } from '@/features/auth/types/api-auth'

const ETIQUETA_POR_ROL: Record<RolUsuario, string> = {
  VENDEDOR: 'Vendedor',
  GESTOR_COMERCIAL: 'Gestor comercial',
  GERENTE: 'Gerente',
}

/** Nombre del rol para mostrar, por ejemplo "Gestor comercial". */
export function describirRol(rol: RolUsuario) {
  return ETIQUETA_POR_ROL[rol]
}
