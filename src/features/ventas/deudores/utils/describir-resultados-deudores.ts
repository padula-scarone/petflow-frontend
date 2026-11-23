import type { EstadoListaDeudores } from '@/features/ventas/deudores/types/cuenta-corriente'
import { describirRangoMostrado } from '@/features/ventas/utils/describir-resultados-lista'

/** Texto para escritorio, por ejemplo "Mostrando 1–10 de 12 deudores". */
export function describirResultadosDeudores(estadoLista: EstadoListaDeudores) {
  if (estadoLista.tipo === 'cargando') return 'Cargando…'
  if (estadoLista.tipo === 'sin-resultados' || estadoLista.tipo === 'sin-deudores') return '0 deudores'
  if (estadoLista.tipo !== 'con-deudores') return ''
  const { filas, paginacion } = estadoLista
  return describirRangoMostrado(paginacion, filas.length, 'deudor', 'deudores')
}
