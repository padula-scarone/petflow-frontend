import type { RutaSeccion } from '@/features/navegacion/types/rutas'
import {
  ID_MODULO_VENTAS,
  ID_SECCION_REGISTRAR_VENTA,
} from '@/features/ventas/config/rutas-registrar-venta'
import { LayoutRegistrarVenta } from '@/features/ventas/paginas/layout-registrar-venta'
import { PaginaRegistrarVentaCarrito } from '@/features/ventas/paginas/pagina-registrar-venta-carrito'
import { PaginaRegistrarVentaCobro } from '@/features/ventas/paginas/pagina-registrar-venta-cobro'
import { PaginaRegistrarVentaComprobante } from '@/features/ventas/paginas/pagina-registrar-venta-comprobante'

/** Secciones de Ventas que ya tienen pantalla; el resto muestra "en construccion". */
export const RUTAS_VENTAS: RutaSeccion[] = [
  {
    idModulo: ID_MODULO_VENTAS,
    idSeccion: ID_SECCION_REGISTRAR_VENTA,
    ruta: {
      element: <LayoutRegistrarVenta />,
      children: [
        { index: true, element: <PaginaRegistrarVentaCarrito /> },
        { path: 'cobro', element: <PaginaRegistrarVentaCobro /> },
        { path: 'comprobante', element: <PaginaRegistrarVentaComprobante /> },
      ],
    },
  },
]
