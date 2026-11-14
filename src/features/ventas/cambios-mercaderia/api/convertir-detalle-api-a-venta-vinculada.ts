import { convertirTextoAMilesimas } from '@/features/ventas/api/conversores-numericos'
import { convertirDetalleApiAVentaDetalle } from '@/features/ventas/api/convertir-detalle-api-a-venta-detalle'
import type {
  ItemVentaVinculable,
  VentaVinculada,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import type { VentaDetalleApi } from '@/features/ventas/types/api-ventas'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type { ProductoCatalogo } from '@/features/ventas/types/venta'

const FACTOR_MILESIMAS = 1000

/**
 * Traduce el detalle de la venta que se va a vincular. Cada renglon suma lo ya devuelto en cambios ACTIVOS
 * (`cantidadYaDevuelta`) y, si es una unidad con granel vinculado, los datos de bolsa abierta: el detalle de la
 * venta no los trae, salen del catalogo. Un producto que ya no esta en el catalogo (inactivo) queda sin bolsa
 * abierta, porque no se conoce su peso unitario. Devuelve null si algun numero no se lee.
 */
export function convertirDetalleApiAVentaVinculada(
  detalle: VentaDetalleApi,
  medios: MedioPago[],
  catalogo: ProductoCatalogo[],
): VentaVinculada | null {
  const venta = convertirDetalleApiAVentaDetalle(detalle, medios)
  if (venta === null) return null

  const items: ItemVentaVinculable[] = []
  for (const [indice, item] of venta.items.entries()) {
    const yaDevueltoMilesimas = convertirTextoAMilesimas(detalle.items[indice].cantidadYaDevuelta)
    if (yaDevueltoMilesimas === null) return null

    const bolsaAbierta =
      item.formatoVenta === 'UNIDAD'
        ? (catalogo.find((producto) => Number(producto.idProducto) === item.idProducto)?.bolsaAbierta ?? null)
        : null
    items.push({
      ...item,
      cantidadYaDevuelta: yaDevueltoMilesimas / FACTOR_MILESIMAS,
      idProductoGranel: bolsaAbierta?.idProductoGranel ?? null,
      nombreProductoGranel: bolsaAbierta?.nombreProductoGranel ?? null,
      pesoNominalKg: bolsaAbierta ? bolsaAbierta.pesoUnitarioMilesimas / FACTOR_MILESIMAS : null,
      pesoNominalMilesimas: bolsaAbierta?.pesoUnitarioMilesimas ?? null,
    })
  }
  return { ...venta, items }
}
