import type { EstadoListaCambios } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { describirRangoMostrado, describirTotal } from '@/features/ventas/utils/describir-resultados-lista'

/** Texto completo para escritorio, por ejemplo "Mostrando 1–10 de 47 cambios". */
export function describirResultadosCambios(estadoLista: EstadoListaCambios) {
  if (estadoLista.tipo === 'cargando') return 'Cargando…'
  if (estadoLista.tipo === 'sin-resultados') return '0 cambios'
  if (estadoLista.tipo !== 'con-cambios') return ''
  const { filas, paginacion } = estadoLista
  return describirRangoMostrado(paginacion, filas.length, 'cambio', 'cambios')
}

/** Texto corto para la fila fija de mobile, por ejemplo "47 cambios". */
export function describirCantidadCambios(estadoLista: EstadoListaCambios) {
  if (estadoLista.tipo === 'cargando') return 'Cargando…'
  if (estadoLista.tipo === 'sin-resultados') return '0 cambios'
  if (estadoLista.tipo !== 'con-cambios') return ''
  return describirTotal(estadoLista.paginacion.totalRegistros, 'cambio', 'cambios')
}
