import type {
  ArticuloDevueltoCargado,
  ArticuloEntregadoCargado,
  ItemVentaVinculable,
  OpcionBolsaAbierta,
  ProductoCatalogoCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'

/** Redondea a 3 decimales (la precision de las cantidades) para que 2,5 - 0,1 no quede en 2,4000000001. */
function redondearCantidad(cantidad: number) {
  return Math.round(cantidad * 1000) / 1000
}

/** Cuanto se puede devolver todavia de un renglon: lo vendido menos lo ya devuelto por cambios ACTIVOS. */
export function calcularCantidadDisponible(item: ItemVentaVinculable) {
  return Math.max(0, redondearCantidad(item.cantidad - item.cantidadYaDevuelta))
}

/**
 * Datos de "Bolsa abierta" de un renglon de la venta: solo si es una unidad con variante a granel.
 * El kilo se valua al precio pagado por la bolsa dividido su peso nominal.
 */
function crearOpcionBolsaAbiertaDesdeItem(item: ItemVentaVinculable): OpcionBolsaAbierta | null {
  if (item.formatoVenta !== 'UNIDAD') return null
  if (item.idProductoGranel === null || item.pesoNominalKg === null || item.nombreProductoGranel === null) {
    return null
  }
  return {
    idProductoGranel: item.idProductoGranel,
    nombreProductoGranel: item.nombreProductoGranel,
    pesoNominalKg: item.pesoNominalKg,
    precioPorKg: item.precioUnitario / item.pesoNominalKg,
  }
}

/** Articulo devuelto elegido entre los renglones de la venta vinculada, con el precio que se pago. */
export function crearArticuloDevueltoDesdeItem(item: ItemVentaVinculable): ArticuloDevueltoCargado {
  return {
    idProducto: item.idProducto,
    nombreProducto: item.nombreProducto,
    formatoVenta: item.formatoVenta,
    origen: 'VENTA',
    precioUnitario: item.precioUnitario,
    // Una unidad por defecto; un renglon a granel espera que se pese lo que vuelve
    cantidad: item.formatoVenta === 'UNIDAD' ? 1 : null,
    cantidadMaximaDisponible: calcularCantidadDisponible(item),
    cantidadYaDevuelta: item.cantidadYaDevuelta,
    opcionBolsaAbierta: crearOpcionBolsaAbiertaDesdeItem(item),
    esBolsaAbierta: false,
    pesoDevueltoKg: null,
  }
}

/** Articulo devuelto buscado en el catalogo (cambio sin venta): se valua al precio actual. */
export function crearArticuloDevueltoDesdeCatalogo(producto: ProductoCatalogoCambio): ArticuloDevueltoCargado {
  return {
    idProducto: producto.idProducto,
    nombreProducto: producto.nombreProducto,
    formatoVenta: producto.formatoVenta,
    origen: 'CATALOGO',
    precioUnitario: producto.precioUnitario,
    cantidad: producto.formatoVenta === 'UNIDAD' ? 1 : null,
    cantidadMaximaDisponible: null,
    cantidadYaDevuelta: 0,
    opcionBolsaAbierta: producto.opcionBolsaAbierta,
    esBolsaAbierta: false,
    pesoDevueltoKg: null,
  }
}

/** Articulo entregado elegido del catalogo. */
export function crearArticuloEntregado(producto: ProductoCatalogoCambio): ArticuloEntregadoCargado {
  return {
    idProducto: producto.idProducto,
    nombreProducto: producto.nombreProducto,
    formatoVenta: producto.formatoVenta,
    precioUnitario: producto.precioUnitario,
    stockDisponible: producto.stockDisponible,
    cantidad: producto.formatoVenta === 'UNIDAD' ? 1 : null,
  }
}

/**
 * Activa o desactiva "Bolsa abierta". Abierta: es una sola bolsa y el peso arranca en el nominal
 * (el usuario lo corrige con el pesaje real). Cerrada: vuelve la unidad entera.
 */
export function aplicarBolsaAbierta(
  articulo: ArticuloDevueltoCargado,
  esBolsaAbierta: boolean,
): ArticuloDevueltoCargado {
  if (articulo.opcionBolsaAbierta === null) return articulo
  return {
    ...articulo,
    esBolsaAbierta,
    cantidad: 1,
    pesoDevueltoKg: esBolsaAbierta ? articulo.opcionBolsaAbierta.pesoNominalKg : null,
  }
}
