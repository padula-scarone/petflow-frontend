import { esObjeto } from '@/lib/es-objeto'
import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import { crearFalloRespuestaInvalida } from '@/features/ventas/api/crear-fallo-respuesta-invalida'
import { descartarSiHayNulos } from '@/features/ventas/api/descartar-si-hay-nulos'
import { convertirTextoACentavos, convertirTextoAMilesimas } from '@/features/ventas/api/conversores-numericos'
import { convertirFormatoApiAFormato, esFormatoVentaApi } from '@/features/ventas/api/conversores-enums'
import type { ConsultarProductosResponse, ProductoApi } from '@/features/ventas/types/api-ventas'
import type { ProductoCatalogo } from '@/features/ventas/types/venta'
import { convertirCentavosAPesos } from '@/features/ventas/utils/calcular-centavos'

const RUTA_PRODUCTOS_API = '/api/productos'
const FACTOR_MILESIMAS = 1000

function esProductoApi(valor: unknown): valor is ProductoApi {
  return (
    esObjeto(valor) &&
    typeof valor.idProducto === 'number' &&
    typeof valor.nombre === 'string' &&
    typeof valor.precioVenta === 'string' &&
    typeof valor.stockFisico === 'string' &&
    esFormatoVentaApi(valor.formatoVenta)
  )
}

function esConsultarProductosResponse(valor: unknown): valor is ConsultarProductosResponse {
  return esObjeto(valor) && Array.isArray(valor.productos) && valor.productos.every(esProductoApi)
}

/** Traduce un producto del back al del front; null si su precio o su stock no son numeros validos. */
function convertirProductoApi(producto: ProductoApi): ProductoCatalogo | null {
  const precioCentavos = convertirTextoACentavos(producto.precioVenta)
  const stockMilesimas = convertirTextoAMilesimas(producto.stockFisico)
  if (precioCentavos === null || stockMilesimas === null) return null
  return {
    idProducto: String(producto.idProducto),
    nombreProducto: producto.nombre,
    formato: convertirFormatoApiAFormato(producto.formatoVenta),
    precioUnitario: convertirCentavosAPesos(precioCentavos),
    stockDisponible: stockMilesimas / FACTOR_MILESIMAS,
  }
}

/**
 * GET /api/productos. Sin `busqueda`: devuelve todo el catalogo activo, que el front filtra en el
 * dispositivo para no pedir al back en cada tecla (RNF-GENERAL-02).
 */
export async function consultarProductosApi(
  cliente: ClienteHttp,
): Promise<ResultadoApi<ProductoCatalogo[]>> {
  const resultado = await cliente.solicitar<unknown>(RUTA_PRODUCTOS_API)
  if (!resultado.exitoso) return resultado
  if (!esConsultarProductosResponse(resultado.datos)) return crearFalloRespuestaInvalida(200)

  const productos = descartarSiHayNulos(resultado.datos.productos.map(convertirProductoApi))
  if (productos === null) return crearFalloRespuestaInvalida(200)
  return { exitoso: true, datos: productos }
}
