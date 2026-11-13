import { esVentaVinculable } from '@/features/ventas/cambios-mercaderia/config/reglas-cambios'
import type {
  CambioMercaderiaDetalle,
  FiltrosBusquedaVenta,
  ItemVentaVinculable,
  VentaVinculable,
  VentaVinculada,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import { obtenerProductoCambioEjemplo } from '@/features/ventas/cambios-mercaderia/utils/catalogo-cambios-ejemplo'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'
import type { VentaDetalle } from '@/features/ventas/types/historial'
import { formatearFechaCalendario } from '@/features/ventas/utils/calcular-periodo-rapido'
import { obtenerVentaHistorial } from '@/features/ventas/utils/consultar-ventas-ejemplo'

// Temporal: simula el GET /api/ventas (con los filtros que el back todavia no tiene) y el GET /api/ventas/:idVenta
// que usa el alta de un cambio para elegir la venta a vincular.

const normalizarTexto = (texto: string) => texto.trim().toLowerCase()

/** Cambios ACTIVOS de una venta: los unicos que cuentan para el tope de lo ya devuelto. */
function obtenerCambiosActivosDeVenta(cambios: CambioMercaderiaDetalle[], idVenta: number) {
  return cambios.filter((cambio) => cambio.estado === 'ACTIVO' && cambio.ventaVinculada?.idVenta === idVenta)
}

function cumpleFiltros(venta: VentaDetalle, filtros: FiltrosBusquedaVenta) {
  const fechaVenta = formatearFechaCalendario(new Date(venta.fechaHora))
  const textoComprobante = normalizarTexto(filtros.numeroComprobante)

  return (
    // La regla vive en un solo lugar: solo se pueden vincular las ventas COMPLETADA
    esVentaVinculable(venta.estado) &&
    (filtros.fechaDesde === null || fechaVenta >= filtros.fechaDesde) &&
    (filtros.fechaHasta === null || fechaVenta <= filtros.fechaHasta) &&
    (filtros.productoSeleccionado === null ||
      venta.items.some((item) => item.idProducto === filtros.productoSeleccionado?.idProducto)) &&
    (filtros.origen === null || venta.origen === filtros.origen) &&
    (filtros.medioPago === null ||
      (filtros.medioPago === 'MIXTO'
        ? venta.pagos.length >= 2
        : venta.pagos.some((pago) => pago.idMedioPago === filtros.medioPago))) &&
    (textoComprobante === '' || normalizarTexto(venta.numeroComprobante).includes(textoComprobante))
  )
}

/** Filtra las ventas vinculables, las ordena de la mas nueva a la mas vieja y recorta la pagina pedida. */
export function buscarVentasVinculablesEjemplo(
  ventas: VentaDetalle[],
  cambios: CambioMercaderiaDetalle[],
  filtros: FiltrosBusquedaVenta,
  pagina: number,
  cantidadPorPagina: number,
): { ventas: VentaVinculable[]; paginacion: PaginacionResultados } {
  const coincidencias = ventas
    .filter((venta) => cumpleFiltros(venta, filtros))
    .toSorted(
      (primera, segunda) =>
        Date.parse(segunda.fechaHora) - Date.parse(primera.fechaHora) || segunda.idVenta - primera.idVenta,
    )

  const desplazamiento = (pagina - 1) * cantidadPorPagina
  return {
    ventas: coincidencias.slice(desplazamiento, desplazamiento + cantidadPorPagina).map((venta) => ({
      ...obtenerVentaHistorial(venta),
      cantidadCambiosActivos: obtenerCambiosActivosDeVenta(cambios, venta.idVenta).length,
    })),
    paginacion: {
      pagina,
      cantidadPorPagina,
      totalRegistros: coincidencias.length,
      totalPaginas: Math.ceil(coincidencias.length / cantidadPorPagina),
    },
  }
}

/**
 * Arma la venta vinculada: la venta tal cual, mas por renglon lo que ya se devolvio en cambios ACTIVOS
 * anteriores y los datos de su variante a granel. La venta original no se modifica.
 */
export function construirVentaVinculada(venta: VentaDetalle, cambios: CambioMercaderiaDetalle[]): VentaVinculada {
  const cambiosActivos = obtenerCambiosActivosDeVenta(cambios, venta.idVenta)

  const items: ItemVentaVinculable[] = venta.items.map((item) => {
    // Una bolsa abierta devuelve un peso, pero cuenta como una unidad del renglon
    const cantidadYaDevuelta = cambiosActivos
      .filter((cambio) => cambio.articuloDevuelto.idProducto === item.idProducto)
      .reduce(
        (acumulado, cambio) =>
          acumulado + (cambio.articuloDevuelto.esBolsaAbierta ? 1 : cambio.articuloDevuelto.cantidad),
        0,
      )
    const producto = obtenerProductoCambioEjemplo(item.idProducto)
    const granel = producto.idProductoGranel === null ? null : obtenerProductoCambioEjemplo(producto.idProductoGranel)
    return {
      ...item,
      cantidadYaDevuelta,
      idProductoGranel: granel?.idProducto ?? null,
      nombreProductoGranel: granel?.nombreProducto ?? null,
      pesoNominalKg: producto.pesoNominalKg,
    }
  })

  return { ...venta, items }
}
