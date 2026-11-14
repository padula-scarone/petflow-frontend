import type {
  OpcionBolsaAbierta,
  ProductoCatalogoCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import { PRODUCTOS_EJEMPLO } from '@/features/ventas/utils/crear-ventas-ejemplo'
import type { FormatoVenta } from '@/features/ventas/types/historial'

// Temporal: catalogo de ejemplo de Cambios. Parte del de Historial y le suma el stock, la variante a
// granel de cada bolsa y su peso nominal (datos que el back todavia no expone).

/** Producto del catalogo de ejemplo con lo que necesita un cambio. */
export interface ProductoCambioEjemplo {
  idProducto: number
  nombreProducto: string
  formatoVenta: FormatoVenta
  precioUnitario: number
  stockDisponible: number
  /** Producto a granel que recibe el contenido de una bolsa abierta; null si no tiene. */
  idProductoGranel: number | null
  /** Peso de la bolsa cerrada en kg; null si no tiene variante a granel. */
  pesoNominalKg: number | null
}

/** Variantes a granel y pesos nominales de las bolsas del catalogo de ejemplo. */
const DATOS_GRANEL_POR_PRODUCTO: Record<number, { idProductoGranel: number; pesoNominalKg: number }> = {
  1: { idProductoGranel: 9, pesoNominalKg: 15 },
  2: { idProductoGranel: 8, pesoNominalKg: 7.5 },
  10: { idProductoGranel: 4, pesoNominalKg: 15 },
}

/**
 * Stock de ejemplo. Las piedras sanitarias (3) estan sin stock a proposito: se ven en el buscador pero no se
 * pueden elegir como articulo entregado. Del rascador (7) quedan 3, y el servidor igual responde 409 al entregarlo.
 */
const STOCK_POR_PRODUCTO: Record<number, number> = { 3: 0, 7: 3, 4: 85, 8: 120, 9: 60 }
const STOCK_POR_DEFECTO = 14

export const CATALOGO_CAMBIOS_EJEMPLO: ProductoCambioEjemplo[] = [
  ...PRODUCTOS_EJEMPLO.map((producto) => ({
    idProducto: producto.idProducto,
    nombreProducto: producto.nombreProducto,
    formatoVenta: producto.formatoVenta,
    precioUnitario: producto.precioUnitario,
    stockDisponible: STOCK_POR_PRODUCTO[producto.idProducto] ?? STOCK_POR_DEFECTO,
    idProductoGranel: DATOS_GRANEL_POR_PRODUCTO[producto.idProducto]?.idProductoGranel ?? null,
    pesoNominalKg: DATOS_GRANEL_POR_PRODUCTO[producto.idProducto]?.pesoNominalKg ?? null,
  })),
  {
    idProducto: 9,
    nombreProducto: 'Alimento perro adulto (granel)',
    formatoVenta: 'GRANEL',
    precioUnitario: 3300,
    stockDisponible: STOCK_POR_PRODUCTO[9],
    idProductoGranel: null,
    pesoNominalKg: null,
  },
  {
    idProducto: 10,
    nombreProducto: 'Alimento balanceado perro cachorro 15 kg',
    formatoVenta: 'UNIDAD',
    precioUnitario: 41800,
    stockDisponible: STOCK_POR_DEFECTO,
    idProductoGranel: DATOS_GRANEL_POR_PRODUCTO[10].idProductoGranel,
    pesoNominalKg: DATOS_GRANEL_POR_PRODUCTO[10].pesoNominalKg,
  },
]

/** Busca un producto del catalogo; falla fuerte si el id no existe en los datos de ejemplo. */
export function obtenerProductoCambioEjemplo(idProducto: number): ProductoCambioEjemplo {
  const producto = CATALOGO_CAMBIOS_EJEMPLO.find((candidato) => candidato.idProducto === idProducto)
  if (!producto) throw new Error(`El producto ${idProducto} no existe en los datos de ejemplo`)
  return producto
}

/**
 * Datos de bolsa abierta de un producto; null si no tiene variante a granel. El kilo se valua al precio actual
 * de la bolsa dividido su peso nominal, no al precio suelto del granel: este suele ser mas caro y devolver una
 * bolsa entera acreditaria mas de lo que cuesta.
 */
export function crearOpcionBolsaAbiertaDeCatalogo(producto: ProductoCambioEjemplo): OpcionBolsaAbierta | null {
  if (producto.idProductoGranel === null || producto.pesoNominalKg === null) return null
  const granel = obtenerProductoCambioEjemplo(producto.idProductoGranel)
  return {
    idProductoGranel: granel.idProducto,
    nombreProductoGranel: granel.nombreProducto,
    pesoNominalKg: producto.pesoNominalKg,
    precioPorKg: producto.precioUnitario / producto.pesoNominalKg,
  }
}

/** Producto en la forma que usan el buscador y los articulos del alta. */
export function convertirAProductoCatalogoCambio(producto: ProductoCambioEjemplo): ProductoCatalogoCambio {
  return {
    idProducto: producto.idProducto,
    nombreProducto: producto.nombreProducto,
    formatoVenta: producto.formatoVenta,
    precioUnitario: producto.precioUnitario,
    stockDisponible: producto.stockDisponible,
    opcionBolsaAbierta: crearOpcionBolsaAbiertaDeCatalogo(producto),
  }
}

/**
 * Productos para ofrecer como articulo entregado: los que cuestan igual o mas que lo devuelto (una unidad),
 * con stock, del mas cercano al mas caro. Asi el vendedor no tiene que saber los precios de memoria.
 */
export function sugerirProductosEntrega(valorDevuelto: number | null, cantidadMaxima = 6): ProductoCatalogoCambio[] {
  if (valorDevuelto === null) return []
  return CATALOGO_CAMBIOS_EJEMPLO.filter(
    (producto) => producto.stockDisponible > 0 && producto.precioUnitario >= valorDevuelto,
  )
    .toSorted((primero, segundo) => primero.precioUnitario - segundo.precioUnitario)
    .slice(0, cantidadMaxima)
    .map(convertirAProductoCatalogoCambio)
}

/** Productos cuyo nombre contiene el texto (sin distinguir mayusculas); sin texto, ninguno. */
export function buscarProductosCambioEjemplo(textoBusqueda: string): ProductoCatalogoCambio[] {
  const texto = textoBusqueda.trim().toLowerCase()
  if (texto === '') return []
  return CATALOGO_CAMBIOS_EJEMPLO.filter((producto) =>
    producto.nombreProducto.toLowerCase().includes(texto),
  ).map(convertirAProductoCatalogoCambio)
}
