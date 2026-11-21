import type { EstadoListaDevoluciones } from '@/features/ventas/devoluciones/types/devolucion'
import { describirRangoMostrado, describirTotal } from '@/features/ventas/utils/describir-resultados-lista'

/** Texto completo para escritorio, por ejemplo "Mostrando 1–10 de 47 devoluciones". */
export function describirResultadosDevoluciones(estadoLista: EstadoListaDevoluciones) {
  if (estadoLista.tipo === 'cargando') return 'Cargando…'
  if (estadoLista.tipo === 'sin-resultados') return '0 devoluciones'
  if (estadoLista.tipo !== 'con-devoluciones') return ''
  const { filas, paginacion } = estadoLista
  return describirRangoMostrado(paginacion, filas.length, 'devolucion', 'devoluciones')
}

/** Texto corto para la fila fija de mobile, por ejemplo "47 devoluciones". */
export function describirCantidadDevoluciones(estadoLista: EstadoListaDevoluciones) {
  if (estadoLista.tipo === 'cargando') return 'Cargando…'
  if (estadoLista.tipo === 'sin-resultados') return '0 devoluciones'
  if (estadoLista.tipo !== 'con-devoluciones') return ''
  return describirTotal(estadoLista.paginacion.totalRegistros, 'devolucion', 'devoluciones')
}
