import type { EstadoListaHistorial } from '@/features/ventas/types/historial'
import { describirRangoMostrado, describirTotal } from '@/features/ventas/utils/describir-resultados-lista'

/** Texto completo para escritorio, por ejemplo "Mostrando 1–10 de 47 ventas". */
export function describirResultados(estadoLista: EstadoListaHistorial) {
  if (estadoLista.tipo === 'cargando') return 'Cargando…'
  if (estadoLista.tipo === 'sin-resultados') return '0 ventas'
  if (estadoLista.tipo !== 'con-ventas') return ''
  const { filas, paginacion } = estadoLista
  return describirRangoMostrado(paginacion, filas.length, 'venta', 'ventas')
}

/** Texto corto para la fila fija de mobile, por ejemplo "47 ventas"; el rango ya lo dice la paginacion. */
export function describirCantidadVentas(estadoLista: EstadoListaHistorial) {
  if (estadoLista.tipo === 'cargando') return 'Cargando…'
  if (estadoLista.tipo === 'sin-resultados') return '0 ventas'
  if (estadoLista.tipo !== 'con-ventas') return ''
  return describirTotal(estadoLista.paginacion.totalRegistros, 'venta', 'ventas')
}
