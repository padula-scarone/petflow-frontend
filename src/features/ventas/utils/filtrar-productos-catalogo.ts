import { CANTIDAD_MAXIMA_RESULTADOS_BUSQUEDA } from '@/features/ventas/config/reglas-venta'
import type { ProductoFiltro } from '@/features/ventas/types/historial'
import type { ProductoCatalogo } from '@/features/ventas/types/venta'
import { normalizarTextoBusqueda } from '@/features/ventas/utils/normalizar-texto-busqueda'

/**
 * Productos del catalogo cuyo nombre contiene el texto, para el buscador de un filtro. El catalogo se pide una
 * vez y se filtra en el dispositivo: no hay un pedido al back por tecla (RNF-GENERAL-02).
 */
export function filtrarProductosCatalogo(catalogo: ProductoCatalogo[], textoBusqueda: string): ProductoFiltro[] {
  const textoNormalizado = normalizarTextoBusqueda(textoBusqueda)
  if (textoNormalizado === '') return []
  return catalogo
    .filter((producto) => normalizarTextoBusqueda(producto.nombreProducto).includes(textoNormalizado))
    .slice(0, CANTIDAD_MAXIMA_RESULTADOS_BUSQUEDA)
    .map((producto) => ({
      idProducto: Number(producto.idProducto),
      nombreProducto: producto.nombreProducto,
    }))
}
