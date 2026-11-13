import type { EstadoListaHistorial } from '@/features/ventas/types/historial'

/** Texto completo para escritorio, por ejemplo "Mostrando 1–10 de 47 ventas". */
export function describirResultados(estadoLista: EstadoListaHistorial) {
  if (estadoLista.tipo === 'cargando') return 'Cargando…'
  if (estadoLista.tipo === 'sin-resultados') return '0 ventas'
  if (estadoLista.tipo !== 'con-ventas') return ''
  const { filas, paginacion } = estadoLista
  const primera = (paginacion.pagina - 1) * paginacion.cantidadPorPagina + 1
  return `Mostrando ${primera}–${primera + filas.length - 1} de ${paginacion.totalRegistros} ventas`
}

/** Texto corto para la fila fija de mobile, por ejemplo "47 ventas"; el rango ya lo dice la paginacion. */
export function describirCantidadVentas(estadoLista: EstadoListaHistorial) {
  if (estadoLista.tipo === 'cargando') return 'Cargando…'
  if (estadoLista.tipo === 'sin-resultados') return '0 ventas'
  if (estadoLista.tipo !== 'con-ventas') return ''
  const { totalRegistros } = estadoLista.paginacion
  return `${totalRegistros} ${totalRegistros === 1 ? 'venta' : 'ventas'}`
}
