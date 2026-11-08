import { Outlet, useLocation } from 'react-router'
import { useCerrarSesionEjemplo } from '@/features/auth/hooks/use-cerrar-sesion-ejemplo'
import { MenuDoble } from '@/features/navegacion/components/menu-doble'
import { MODULOS_MENU } from '@/features/navegacion/config/modulos-menu'
import { useMenuDoble } from '@/features/navegacion/hooks/use-menu-doble'

/** Marco comun de las pantallas internas: el menu doble con la pantalla activa dentro. */
export function LayoutMenu() {
  const { idModuloActivo, idSeccionActiva, seleccionarModulo, seleccionarSeccion, abrirMiPerfil } =
    useMenuDoble(MODULOS_MENU)
  const { cerrarSesion } = useCerrarSesionEjemplo()
  const { pathname } = useLocation()

  return (
    <MenuDoble
      modulos={MODULOS_MENU}
      idModuloActivo={idModuloActivo}
      idSeccionActiva={idSeccionActiva}
      nombreUsuario="Usuario"
      onSeleccionarModulo={seleccionarModulo}
      onSeleccionarSeccion={seleccionarSeccion}
      onAbrirMiPerfil={abrirMiPerfil}
      // Temporal: el hook real de Cerrar sesion tambien descartara el token
      onCerrarSesion={cerrarSesion}
      // La ruta completa reinicia el scroll en cada cambio de pantalla
      claveContenido={pathname}
    >
      <Outlet />
    </MenuDoble>
  )
}
