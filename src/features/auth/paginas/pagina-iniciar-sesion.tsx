import { useNavigate } from 'react-router'
import { IniciarSesion } from '@/features/auth/components/iniciar-sesion'
import { useIniciarSesionEjemplo } from '@/features/auth/hooks/use-iniciar-sesion-ejemplo'
import { RUTA_RAIZ } from '@/features/navegacion/config/rutas'

export function PaginaIniciarSesion() {
  const navegar = useNavigate()
  // replace: el boton atras no debe volver al formulario de inicio de sesion
  const propiedadesInicioSesion = useIniciarSesionEjemplo(() =>
    navegar(RUTA_RAIZ, { replace: true }),
  )
  return <IniciarSesion {...propiedadesInicioSesion} />
}
