import {
  consultarCuentasCorrientesApi,
  type PaginaDeudoresConsultada,
} from '@/features/ventas/deudores/api/cuentas-corrientes-api'
import { DEUDORES_POR_PAGINA } from '@/features/ventas/deudores/config/reglas-deudores'
import type {
  CriterioOrdenDeudores,
  EstadoListaDeudores,
  FiltrosDeudores,
  OpcionProximoPago,
  SentidoOrden,
} from '@/features/ventas/deudores/types/cuenta-corriente'
import { useListaPaginada, type OpcionesListaPaginada } from '@/features/ventas/hooks/use-lista-paginada'
import { traducirErrorConsulta } from '@/features/ventas/utils/traducir-error-venta'

/**
 * Filtros con los que arranca la lista: sin busqueda (solo quienes deben algo), todos los pagos y por proximo pago,
 * del mas cercano al mas lejano: arriba quedan los atrasados y los que vencen primero, y al final los sin fecha.
 */
const FILTROS_DEUDORES_VACIOS: FiltrosDeudores = {
  busqueda: '',
  proximoPago: null,
  ordenarPor: 'PROXIMO_PAGO',
  sentido: 'ASCENDENTE',
}

/** El sentido natural de cada criterio: lo mas importante primero (mas deuda, mas cercano, mas viejo). */
const SENTIDO_INICIAL_POR_CRITERIO: Record<CriterioOrdenDeudores, SentidoOrden> = {
  NOMBRE: 'ASCENDENTE',
  FIADOS_PENDIENTES: 'DESCENDENTE',
  SALDO: 'DESCENDENTE',
  PROXIMO_PAGO: 'ASCENDENTE',
  FIADO_DESDE: 'ASCENDENTE',
}

// Funciones de modulo: el hook las usa dentro de efectos y necesitan identidad estable
const OPCIONES_LISTA_DEUDORES: OpcionesListaPaginada<FiltrosDeudores, PaginaDeudoresConsultada> = {
  consultar: (cliente, filtros, pagina) =>
    consultarCuentasCorrientesApi(cliente, filtros, pagina, DEUDORES_POR_PAGINA),
  contarElementos: (pagina) => pagina.deudores.length,
  // Solo el texto espera a que se deje de tipear; el filtro por proximo pago aplica al instante
  hayTextoPendiente: (escritos, consultados) => escritos.busqueda !== consultados.busqueda,
}

/**
 * Lista paginada de Deudores: filtros, pagina y consulta a GET /api/cuentas-corrientes. La mecanica (espera al
 * tipear, descarte de respuestas viejas, vuelta a la pagina 1 al cambiar filtros, refresco) vive en `useListaPaginada`.
 */
export function useListaDeudores() {
  const lista = useListaPaginada(OPCIONES_LISTA_DEUDORES, FILTROS_DEUDORES_VACIOS)

  // --- CALCULOS ---
  const hayFiltrosEnConsulta =
    lista.filtrosConsulta.busqueda.trim() !== '' || lista.filtrosConsulta.proximoPago !== null

  const calcularEstadoLista = (): EstadoListaDeudores => {
    const { consulta } = lista
    if (consulta.fase === 'cargando') return { tipo: 'cargando' }
    if (consulta.fase === 'error') {
      return {
        tipo: 'error',
        mensaje: traducirErrorConsulta(consulta.error, 'los deudores', 'ver los deudores'),
      }
    }
    const { deudores, paginacion } = consulta.pagina
    if (deudores.length === 0) return { tipo: hayFiltrosEnConsulta ? 'sin-resultados' : 'sin-deudores' }
    return { tipo: 'con-deudores', filas: deudores, paginacion }
  }

  // --- ACCIONES ---
  return {
    filtros: lista.filtros,
    estadoLista: calcularEstadoLista(),
    cambiarBusqueda: (busqueda: string) => lista.establecerFiltros({ ...lista.filtros, busqueda }),
    cambiarProximoPago: (proximoPago: OpcionProximoPago | null) =>
      lista.establecerFiltros({ ...lista.filtros, proximoPago }),
    /** Cambia el criterio y arranca por su sentido natural. */
    cambiarOrden: (ordenarPor: CriterioOrdenDeudores) =>
      lista.establecerFiltros({ ...lista.filtros, ordenarPor, sentido: SENTIDO_INICIAL_POR_CRITERIO[ordenarPor] }),
    invertirSentido: () =>
      lista.establecerFiltros({
        ...lista.filtros,
        sentido: lista.filtros.sentido === 'ASCENDENTE' ? 'DESCENDENTE' : 'ASCENDENTE',
      }),
    /** Quita la busqueda y el filtro por proximo pago; el orden elegido se mantiene. */
    limpiarFiltros: () => lista.establecerFiltros({ ...lista.filtros, busqueda: '', proximoPago: null }),
    cambiarPagina: lista.cambiarPagina,
    reintentar: lista.reintentar,
  }
}
