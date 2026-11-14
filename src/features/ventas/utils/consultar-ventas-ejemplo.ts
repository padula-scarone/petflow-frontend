import { formatearFechaCalendario } from '@/features/ventas/utils/calcular-periodo-rapido'
import { coincideFiltroMedioPago } from '@/features/ventas/utils/coincide-filtro-medio-pago'
import type {
  FiltrosHistorial,
  PaginacionHistorial,
  VentaDetalle,
  VentaHistorial,
} from '@/features/ventas/types/historial'

// Temporal: simula el GET /api/ventas del back (filtros, orden y paginacion del lado del servidor).

/** Deja solo los campos que devuelve la grilla del historial. */
export function obtenerVentaHistorial(venta: VentaDetalle): VentaHistorial {
  return {
    idVenta: venta.idVenta,
    numeroComprobante: venta.numeroComprobante,
    fechaHora: venta.fechaHora,
    estado: venta.estado,
    montoTotal: venta.montoTotal,
    clienteReferencia: venta.clienteReferencia,
    origen: venta.origen,
    modalidadEntrega: venta.modalidadEntrega,
    fechaHoraLimiteModificacion: venta.fechaHoraLimiteModificacion,
  }
}

const normalizarTexto = (texto: string) => texto.trim().toLowerCase()

function cumpleFiltros(venta: VentaDetalle, filtros: FiltrosHistorial) {
  const fechaVenta = formatearFechaCalendario(new Date(venta.fechaHora))
  const textoCliente = normalizarTexto(filtros.textoCliente)
  const textoComprobante = normalizarTexto(filtros.numeroComprobante)

  return (
    (filtros.fechaDesde === null || fechaVenta >= filtros.fechaDesde) &&
    (filtros.fechaHasta === null || fechaVenta <= filtros.fechaHasta) &&
    (filtros.productoSeleccionado === null ||
      venta.items.some((item) => item.idProducto === filtros.productoSeleccionado?.idProducto)) &&
    (filtros.estado === null || venta.estado === filtros.estado) &&
    (filtros.origen === null || venta.origen === filtros.origen) &&
    coincideFiltroMedioPago(venta.pagos, filtros.medioPago) &&
    (textoCliente === '' ||
      normalizarTexto(venta.clienteReferencia ?? '').includes(textoCliente)) &&
    (textoComprobante === '' || normalizarTexto(venta.numeroComprobante).includes(textoComprobante))
  )
}

/** Filtra, ordena de la mas nueva a la mas vieja y recorta la pagina pedida. */
export function consultarVentasEjemplo(
  ventas: VentaDetalle[],
  filtros: FiltrosHistorial,
  pagina: number,
  cantidadPorPagina: number,
): { ventas: VentaHistorial[]; paginacion: PaginacionHistorial } {
  const coincidencias = ventas
    .filter((venta) => cumpleFiltros(venta, filtros))
    .toSorted(
      (primera, segunda) =>
        Date.parse(segunda.fechaHora) - Date.parse(primera.fechaHora) ||
        segunda.idVenta - primera.idVenta,
    )

  const desplazamiento = (pagina - 1) * cantidadPorPagina
  return {
    ventas: coincidencias
      .slice(desplazamiento, desplazamiento + cantidadPorPagina)
      .map(obtenerVentaHistorial),
    paginacion: {
      pagina,
      cantidadPorPagina,
      totalRegistros: coincidencias.length,
      totalPaginas: Math.ceil(coincidencias.length / cantidadPorPagina),
    },
  }
}
