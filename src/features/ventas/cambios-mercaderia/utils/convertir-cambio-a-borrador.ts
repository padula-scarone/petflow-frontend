import type {
  ArticuloDevueltoCargado,
  BorradorCambio,
  CambioMercaderiaDetalle,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import {
  convertirAProductoCatalogoCambio,
  obtenerProductoCambioEjemplo,
} from '@/features/ventas/cambios-mercaderia/utils/catalogo-cambios-ejemplo'
import { construirVentaVinculada } from '@/features/ventas/cambios-mercaderia/utils/buscar-ventas-vinculables-ejemplo'
import {
  crearArticuloDevueltoDesdeCatalogo,
  crearArticuloDevueltoDesdeItem,
  crearArticuloEntregado,
} from '@/features/ventas/cambios-mercaderia/utils/crear-articulos-cambio'
import type { VentaDetalle } from '@/features/ventas/types/historial'

/**
 * Repuebla el alta con los datos de un cambio ya anulado (la edicion). Temporal: simula lo que en la
 * integracion armaria la pantalla con el detalle que devuelve la anulacion. El cambio anulado ya no
 * cuenta en lo devuelto de la venta, asi que sus cantidades vuelven a estar disponibles.
 */
export function convertirCambioABorrador(
  cambio: CambioMercaderiaDetalle,
  ventas: VentaDetalle[],
  cambiosDeLaBase: CambioMercaderiaDetalle[],
): BorradorCambio {
  const venta = cambio.ventaVinculada
    ? ventas.find((candidata) => candidata.idVenta === cambio.ventaVinculada?.idVenta)
    : undefined
  const ventaVinculada = venta ? construirVentaVinculada(venta, cambiosDeLaBase) : null

  const devuelto = cambio.articuloDevuelto
  const itemVenta = ventaVinculada?.items.find((item) => item.idProducto === devuelto.idProducto)
  const base: ArticuloDevueltoCargado = itemVenta
    ? crearArticuloDevueltoDesdeItem(itemVenta)
    : crearArticuloDevueltoDesdeCatalogo(
        convertirAProductoCatalogoCambio(obtenerProductoCambioEjemplo(devuelto.idProducto)),
      )

  const entregado = cambio.articuloEntregado
  const articuloEntregado = {
    ...crearArticuloEntregado(convertirAProductoCatalogoCambio(obtenerProductoCambioEjemplo(entregado.idProducto))),
    cantidad: entregado.cantidad,
  }

  return {
    ventaVinculada,
    articuloDevuelto: {
      ...base,
      esBolsaAbierta: devuelto.esBolsaAbierta,
      // Con bolsa abierta se guardo el peso en la cantidad; la bolsa en si es una sola
      cantidad: devuelto.esBolsaAbierta ? 1 : devuelto.cantidad,
      pesoDevueltoKg: devuelto.esBolsaAbierta ? devuelto.cantidad : null,
    },
    articuloEntregado,
    idMedioPago: cambio.pagoSaldo?.idMedioPago ?? null,
    montoRecibido: cambio.pagoSaldo?.montoRecibido ?? null,
    codigoMotivo: cambio.motivo.codigoMotivo,
    detalleMotivo: cambio.motivo.detalleMotivo ?? '',
  }
}
