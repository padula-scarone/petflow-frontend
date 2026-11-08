import { createBrowserRouter, redirect } from 'react-router'
import { RutaProtegida } from '@/features/auth/components/ruta-protegida'
import { RUTAS_AUTH } from '@/features/auth/rutas/rutas-auth'
import { MODULOS_MENU } from '@/features/navegacion/config/modulos-menu'
import { LayoutMenu } from '@/features/navegacion/paginas/layout-menu'
import { PaginaNoEncontrada } from '@/features/navegacion/paginas/pagina-no-encontrada'
import { construirRutasMenu } from '@/features/navegacion/utils/construir-rutas-menu'
import { RUTAS_REGISTRAR_VENTA } from '@/features/ventas/config/rutas-registrar-venta'
import { RUTAS_VENTAS } from '@/features/ventas/rutas/rutas-ventas'

/** Une las rutas que declara cada feature en un solo arbol. */
export const enrutador = createBrowserRouter([
  ...RUTAS_AUTH,
  {
    // Guard de las pantallas internas; sin path, no agrega segmento a la URL
    element: <RutaProtegida />,
    children: [
      { index: true, loader: () => redirect(RUTAS_REGISTRAR_VENTA.carrito) },
      { element: <LayoutMenu />, children: construirRutasMenu(MODULOS_MENU, RUTAS_VENTAS) },
    ],
  },
  // Fuera del layout: una URL desconocida no tiene modulo que marcar en el menu
  { path: '*', element: <PaginaNoEncontrada /> },
])
