import type { EstadoListaDevoluciones } from '@/features/ventas/devoluciones/types/devolucion'
import { describirRangoMostrado } from '@/features/ventas/utils/describir-resultados-lista'

/** Texto completo para escritorio, por ejemplo "Mostrando 1–10 de 47 devoluciones". */
export function describirResultadosDevoluciones(estadoLista: EstadoListaDevoluciones) {
  if (estadoLista.tipo === 'cargando') return 'Cargando…'
  if (estadoLista.tipo === 'sin-resultados') return '0 devoluciones'
  if (estadoLista.tipo !== 'con-devoluciones') return ''
  const { filas, paginacion } = estadoLista
  return describirRangoMostrado(paginacion, filas.length, 'devolucion', 'devoluciones')
}
