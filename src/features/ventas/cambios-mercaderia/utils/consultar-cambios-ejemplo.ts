import type {
  CambioMercaderiaDetalle,
  CambioMercaderiaListado,
  FiltrosCambios,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'
import { formatearFechaCalendario } from '@/features/ventas/utils/calcular-periodo-rapido'

// Temporal: simula el GET /api/cambios-mercaderia del back (filtros, orden y paginacion del lado del servidor).

/** Deja solo los campos que devuelve la grilla de cambios. */
export function obtenerCambioListado(cambio: CambioMercaderiaDetalle): CambioMercaderiaListado {
  const { articuloDevuelto, articuloEntregado, pagoSaldo } = cambio
  return {
    idCambio: cambio.idCambio,
    fechaHora: cambio.fechaHora,
    estado: cambio.estado,
    ventaVinculada: cambio.ventaVinculada,
    productoDevuelto: {
      idProducto: articuloDevuelto.idProducto,
      nombreProducto: articuloDevuelto.nombreProducto,
      formatoVenta: articuloDevuelto.formatoVenta,
      cantidad: articuloDevuelto.cantidad,
      esBolsaAbierta: articuloDevuelto.esBolsaAbierta,
    },
    productoEntregado: {
      idProducto: articuloEntregado.idProducto,
      nombreProducto: articuloEntregado.nombreProducto,
      formatoVenta: articuloEntregado.formatoVenta,
      cantidad: articuloEntregado.cantidad,
    },
    saldoResultante: cambio.saldoResultante,
    idMedioPago: pagoSaldo?.idMedioPago ?? null,
    nombreMedioPago: pagoSaldo?.nombreMedioPago ?? null,
    fechaHoraLimiteModificacion: cambio.fechaHoraLimiteModificacion,
  }
}

function cumpleFiltros(cambio: CambioMercaderiaDetalle, filtros: FiltrosCambios) {
  const fechaCambio = formatearFechaCalendario(new Date(cambio.fechaHora))
  const idProductoFiltrado = filtros.productoSeleccionado?.idProducto

  return (
    (filtros.fechaDesde === null || fechaCambio >= filtros.fechaDesde) &&
    (filtros.fechaHasta === null || fechaCambio <= filtros.fechaHasta) &&
    // El producto puede ser el devuelto o el entregado
    (idProductoFiltrado === undefined ||
      cambio.articuloDevuelto.idProducto === idProductoFiltrado ||
      cambio.articuloEntregado.idProducto === idProductoFiltrado) &&
    (filtros.estado === null || cambio.estado === filtros.estado) &&
    (filtros.vinculo === null ||
      (filtros.vinculo === 'VINCULADO' ? cambio.ventaVinculada !== null : cambio.ventaVinculada === null)) &&
    (filtros.medioPago === null || cambio.pagoSaldo?.idMedioPago === filtros.medioPago)
  )
}

/** Filtra, ordena del mas nuevo al mas viejo y recorta la pagina pedida. */
export function consultarCambiosEjemplo(
  cambios: CambioMercaderiaDetalle[],
  filtros: FiltrosCambios,
  pagina: number,
  cantidadPorPagina: number,
): { cambios: CambioMercaderiaListado[]; paginacion: PaginacionResultados } {
  const coincidencias = cambios
    .filter((cambio) => cumpleFiltros(cambio, filtros))
    .toSorted(
      (primero, segundo) =>
        Date.parse(segundo.fechaHora) - Date.parse(primero.fechaHora) || segundo.idCambio - primero.idCambio,
    )

  const desplazamiento = (pagina - 1) * cantidadPorPagina
  return {
    cambios: coincidencias.slice(desplazamiento, desplazamiento + cantidadPorPagina).map(obtenerCambioListado),
    paginacion: {
      pagina,
      cantidadPorPagina,
      totalRegistros: coincidencias.length,
      totalPaginas: Math.ceil(coincidencias.length / cantidadPorPagina),
    },
  }
}
