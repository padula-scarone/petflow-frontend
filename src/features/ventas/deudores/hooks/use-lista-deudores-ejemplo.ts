import {
  consultarDeudoresApiEjemplo,
  type PaginaDeudoresConsultada,
} from '@/features/ventas/deudores/ejemplos/api-deudores-ejemplo'
import { DEUDORES_POR_PAGINA } from '@/features/ventas/deudores/config/reglas-deudores'
import type {
  EstadoListaDeudores,
  OpcionProximoPago,
  FiltrosDeudores,
} from '@/features/ventas/deudores/types/cuenta-corriente'
import { useListaPaginada, type OpcionesListaPaginada } from '@/features/ventas/hooks/use-lista-paginada'
import { traducirErrorConsulta } from '@/features/ventas/utils/traducir-error-venta'

/** Filtros con los que arranca la lista: sin busqueda (solo quienes deben algo) y sin filtro por proximo pago. */
const FILTROS_DEUDORES_VACIOS: FiltrosDeudores = { busqueda: '', proximoPago: null, fechaProximoPago: null }

// Funciones de modulo: el hook las usa dentro de efectos y necesitan identidad estable
const OPCIONES_LISTA_DEUDORES: OpcionesListaPaginada<FiltrosDeudores, PaginaDeudoresConsultada> = {
  // El cliente del back real no se usa: la consulta es de ejemplo
  consultar: (_cliente, filtros, pagina) => consultarDeudoresApiEjemplo(filtros, pagina, DEUDORES_POR_PAGINA),
  contarElementos: (pagina) => pagina.deudores.length,
  // Solo el texto espera a que se deje de tipear; el filtro por proximo pago aplica al instante
  hayTextoPendiente: (escritos, consultados) => escritos.busqueda !== consultados.busqueda,
}

/**
 * Lista paginada de Deudores: filtros, pagina y consulta (de ejemplo, hasta que el back tenga el saldo). La
 * mecanica (espera al tipear, descarte de respuestas viejas, refresco) vive en `useListaPaginada`.
 */
export function useListaDeudoresEjemplo() {
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
      // Cambiar de opcion descarta el dia elegido: solo vale para "Un dia"
      lista.establecerFiltros({ ...lista.filtros, proximoPago, fechaProximoPago: null }),
    cambiarFechaProximoPago: (fechaProximoPago: string) =>
      lista.establecerFiltros({ ...lista.filtros, proximoPago: 'FECHA', fechaProximoPago }),
    limpiarFiltros: () => lista.establecerFiltros(FILTROS_DEUDORES_VACIOS),
    cambiarPagina: lista.cambiarPagina,
    reintentar: lista.reintentar,
  }
}
