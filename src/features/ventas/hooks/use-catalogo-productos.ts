import { consultarProductosApi } from '@/features/ventas/api/consultar-productos-api'
import { useRecursoRemoto } from '@/features/ventas/hooks/use-recurso-remoto'

const DESCRIPCION_PRODUCTOS = { recurso: 'los productos', accion: 'ver los productos' }

/** Catalogo de productos activos del back: se pide una sola vez por venta y se filtra en el dispositivo. */
export function useCatalogoProductos() {
  return useRecursoRemoto(consultarProductosApi, DESCRIPCION_PRODUCTOS)
}
