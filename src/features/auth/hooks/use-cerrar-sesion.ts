import { useSesion } from '@/features/auth/hooks/use-sesion'

/**
 * Cerrar sesion: sin confirmacion. Descarta la sesion en memoria y en el almacenamiento; el guard
 * (RutaProtegida) lleva a /iniciar-sesion con replace y sin ruta de regreso, y al desmontarse las
 * pantallas internas se descarta tambien la venta en curso, que solo vive en su estado.
 */
export function useCerrarSesion() {
  const { cerrarSesion } = useSesion()
  return { cerrarSesion }
}
