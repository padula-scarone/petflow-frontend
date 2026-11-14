import { esObjeto } from '@/lib/es-objeto'
import type { ClienteHttp, ResultadoApi } from '@/lib/cliente-http.types'
import { crearFalloRespuestaInvalida } from '@/features/ventas/api/crear-fallo-respuesta-invalida'
import { descartarSiHayNulos } from '@/features/ventas/api/descartar-si-hay-nulos'
import { convertirTextoACentavos, convertirTextoAMilesimas } from '@/features/ventas/api/conversores-numericos'
import { convertirFormatoApiAFormato, esFormatoVentaApi } from '@/features/ventas/api/conversores-enums'
import type { ConsultarProductosResponse, ProductoApi } from '@/features/ventas/types/api-ventas'
import type { DatosBolsaAbierta, ProductoCatalogo } from '@/features/ventas/types/venta'
import { convertirCentavosAPesos } from '@/features/ventas/utils/calcular-centavos'

const RUTA_PRODUCTOS_API = '/api/productos'
const FACTOR_MILESIMAS = 1000

function esProductoApi(valor: unknown): valor is ProductoApi {
  return (
    esObjeto(valor) &&
    typeof valor.idProducto === 'number' &&
    typeof valor.nombre === 'string' &&
    typeof valor.categoria === 'string' &&
    typeof valor.precioVenta === 'string' &&
    typeof valor.stockFisico === 'string' &&
    esFormatoVentaApi(valor.formatoVenta) &&
    esBolsaAbiertaApiValida(valor)
  )
}

const esTextoONulo = (valor: unknown) => valor === undefined || valor === null || typeof valor === 'string'

/** Los campos de bolsa abierta son opcionales, pero si llegan deben tener la forma del contrato. */
function esBolsaAbiertaApiValida(valor: Record<string, unknown>) {
  return (
    (valor.permiteBolsaAbierta === undefined || typeof valor.permiteBolsaAbierta === 'boolean') &&
    (valor.idProductoGranel === undefined ||
      valor.idProductoGranel === null ||
      typeof valor.idProductoGranel === 'number') &&
    esTextoONulo(valor.nombreProductoGranel) &&
    esTextoONulo(valor.pesoUnitario)
  )
}

/** Datos de bolsa abierta del producto; null si no la permite o si faltan el granel o un peso unitario valido. */
function convertirBolsaAbiertaApi(producto: ProductoApi): DatosBolsaAbierta | null {
  if (producto.permiteBolsaAbierta !== true) return null
  const { idProductoGranel, nombreProductoGranel, pesoUnitario } = producto
  if (idProductoGranel == null || nombreProductoGranel == null || pesoUnitario == null) return null
  const pesoUnitarioMilesimas = convertirTextoAMilesimas(pesoUnitario)
  if (pesoUnitarioMilesimas === null || pesoUnitarioMilesimas <= 0) return null
  return { idProductoGranel, nombreProductoGranel, pesoUnitarioMilesimas }
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
    categoria: producto.categoria,
    formato: convertirFormatoApiAFormato(producto.formatoVenta),
    precioUnitario: convertirCentavosAPesos(precioCentavos),
    stockDisponible: stockMilesimas / FACTOR_MILESIMAS,
    bolsaAbierta: convertirBolsaAbiertaApi(producto),
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
