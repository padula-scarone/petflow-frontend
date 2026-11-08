import { useNavigate } from 'react-router'
import { RUTA_INICIAR_SESION } from '@/features/auth/config/rutas-auth'

// --- DATOS DE EJEMPLO ---
// Hook temporal que simula cerrar sesion sin back, como useIniciarSesionEjemplo simula el inicio.
// Se reemplaza por el hook real de la accion Cerrar sesion: ademas de navegar, descartara el token.
export function useCerrarSesionEjemplo() {
  const navegar = useNavigate()

  // replace: el boton atras no debe volver a la pantalla interna desde la que se cerro la sesion
  const cerrarSesion = () => navegar(RUTA_INICIAR_SESION, { replace: true })

  return { cerrarSesion }
}
