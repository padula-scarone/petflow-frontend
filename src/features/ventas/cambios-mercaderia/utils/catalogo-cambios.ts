import type {
  OpcionBolsaAbierta,
  ProductoCatalogoCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import type { ProductoCatalogo } from '@/features/ventas/types/venta'
import { normalizarTextoBusqueda } from '@/features/ventas/utils/normalizar-texto-busqueda'
import { CANTIDAD_MAXIMA_RESULTADOS_BUSQUEDA } from '@/features/ventas/config/reglas-venta'

const FACTOR_MILESIMAS = 1000
const CANTIDAD_MAXIMA_SUGERENCIAS = 6

/**
 * Datos de "Bolsa abierta" de un producto en unidades con granel vinculado; null si no los tiene. El precio por
 * kg (precio de la bolsa sobre su peso) es solo para mostrar: nunca se usa el precio suelto del granel.
 */
export function crearOpcionBolsaAbierta(
  precioBolsa: number,
  datos: NonNullable<ProductoCatalogo['bolsaAbierta']> | null | undefined,
): OpcionBolsaAbierta | null {
  if (!datos) return null
  const pesoNominalKg = datos.pesoUnitarioMilesimas / FACTOR_MILESIMAS
  return {
    idProductoGranel: datos.idProductoGranel,
    nombreProductoGranel: datos.nombreProductoGranel,
    pesoNominalKg,
    pesoNominalMilesimas: datos.pesoUnitarioMilesimas,
    precioPorKg: Math.round((precioBolsa / pesoNominalKg) * 100) / 100,
  }
}

/** Producto del catalogo del back en la forma que usan el buscador y los articulos del alta de un cambio. */
export function convertirProductoACatalogoCambio(producto: ProductoCatalogo): ProductoCatalogoCambio {
  const esUnidad = producto.formato === 'unidad'
  return {
    idProducto: Number(producto.idProducto),
    nombreProducto: producto.nombreProducto,
    formatoVenta: esUnidad ? 'UNIDAD' : 'GRANEL',
    precioUnitario: producto.precioUnitario,
    stockDisponible: producto.stockDisponible,
    urlImagen: producto.urlImagen,
    opcionBolsaAbierta: esUnidad ? crearOpcionBolsaAbierta(producto.precioUnitario, producto.bolsaAbierta) : null,
  }
}

/** Productos cuyo nombre contiene el texto (sin distinguir mayusculas ni tildes); sin texto, ninguno. */
export function buscarProductosCatalogoCambio(
  catalogo: ProductoCatalogoCambio[],
  textoBusqueda: string,
): ProductoCatalogoCambio[] {
  const texto = normalizarTextoBusqueda(textoBusqueda)
  if (texto === '') return []
  return catalogo
    .filter((producto) => normalizarTextoBusqueda(producto.nombreProducto).includes(texto))
    .slice(0, CANTIDAD_MAXIMA_RESULTADOS_BUSQUEDA)
}

/**
 * Productos para ofrecer como articulo entregado: los que cuestan igual o mas que lo devuelto (una unidad), con
 * stock, del mas cercano al mas caro. Asi el vendedor no tiene que saber los precios de memoria.
 */
export function sugerirProductosEntrega(
  catalogo: ProductoCatalogoCambio[],
  valorDevuelto: number | null,
): ProductoCatalogoCambio[] {
  if (valorDevuelto === null) return []
  return catalogo
    .filter((producto) => producto.stockDisponible > 0 && producto.precioUnitario >= valorDevuelto)
    .toSorted((primero, segundo) => primero.precioUnitario - segundo.precioUnitario)
    .slice(0, CANTIDAD_MAXIMA_SUGERENCIAS)
}
