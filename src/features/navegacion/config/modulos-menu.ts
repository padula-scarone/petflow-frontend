import { Package, ShoppingCart } from 'lucide-react'
import type { ModuloMenu } from '@/features/navegacion/types/menu'

/** Estructura de navegacion de la aplicacion. */
export const MODULOS_MENU: ModuloMenu[] = [
  {
    idModulo: 'ventas',
    etiqueta: 'Ventas',
    icono: ShoppingCart,
    secciones: [
      { idSeccion: 'registrar-venta', etiqueta: 'Registrar venta' },
      { idSeccion: 'historial', etiqueta: 'Historial' },
      { idSeccion: 'medios-de-pago', etiqueta: 'Medios de pago' },
      { idSeccion: 'cambios-posventa', etiqueta: 'Cambios posventa' },
    ],
  },
  {
    idModulo: 'inventario',
    etiqueta: 'Inventario',
    icono: Package,
    // Provisorio: el wireframe todavia no define las secciones de Inventario
    secciones: [{ idSeccion: 'catalogo', etiqueta: 'Catálogo' }],
  },
]
