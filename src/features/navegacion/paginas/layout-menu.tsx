import { Outlet, useLocation } from 'react-router'
import { MenuDoble } from '@/features/navegacion/components/menu-doble'
import { MODULOS_MENU } from '@/features/navegacion/config/modulos-menu'
import { useMenuDoble } from '@/features/navegacion/hooks/use-menu-doble'

/** Marco comun de las pantallas internas: el menu doble con la pantalla activa dentro. */
export function LayoutMenu() {
  const { idModuloActivo, idSeccionActiva, seleccionarModulo, seleccionarSeccion } =
    useMenuDoble(MODULOS_MENU)
  const { pathname } = useLocation()

  return (
    <MenuDoble
      modulos={MODULOS_MENU}
      idModuloActivo={idModuloActivo}
      idSeccionActiva={idSeccionActiva}
      nombreUsuario="Usuario"
      onSeleccionarModulo={seleccionarModulo}
      onSeleccionarSeccion={seleccionarSeccion}
      onAbrirMenuUsuario={() => undefined}
      // La ruta completa reinicia el scroll en cada cambio de pantalla
      claveContenido={pathname}
    >
      <Outlet />
    </MenuDoble>
  )
}
