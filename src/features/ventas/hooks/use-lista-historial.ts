import {
  consultarHistorialApi,
  type PaginaHistorialConsultada,
} from '@/features/ventas/api/consultar-historial-api'
import { CANTIDAD_POR_PAGINA_HISTORIAL } from '@/features/ventas/config/reglas-venta'
import { useListaPaginada, type OpcionesListaPaginada } from '@/features/ventas/hooks/use-lista-paginada'
import type {
  FiltrosHistorial,
  PaginacionHistorial,
  PeriodoRapido,
  VentaHistorialConsultada,
} from '@/features/ventas/types/historial'
import { calcularPeriodoRapido } from '@/features/ventas/utils/calcular-periodo-rapido'
import { contarFiltrosActivos, FILTROS_HISTORIAL_VACIOS } from '@/features/ventas/utils/contar-filtros-activos'
import { corregirRangoFechas } from '@/features/ventas/utils/corregir-rango-fechas'
import { traducirErrorConsulta } from '@/features/ventas/utils/traducir-error-venta'

/** Estado de la consulta de la lista, antes de evaluar los plazos contra la hora del servidor. */
export type ConsultaLista =
  | { fase: 'cargando' }
  | { fase: 'error'; mensaje: string }
  | {
      fase: 'lista'
      ventas: VentaHistorialConsultada[]
      paginacion: PaginacionHistorial
      desfaseServidorMilisegundos: number
    }

// Funciones de modulo: el hook las usa dentro de efectos y necesitan identidad estable
const OPCIONES_LISTA_HISTORIAL: OpcionesListaPaginada<FiltrosHistorial, PaginaHistorialConsultada> = {
  consultar: (cliente, filtros, pagina) =>
    consultarHistorialApi(cliente, filtros, pagina, CANTIDAD_POR_PAGINA_HISTORIAL),
  contarElementos: (pagina) => pagina.ventas.length,
  hayTextoPendiente: (escritos, consultados) =>
    escritos.textoCliente !== consultados.textoCliente ||
    escritos.numeroComprobante !== consultados.numeroComprobante,
}

/**
 * Lista paginada del Historial: filtros, pagina y consulta a GET /api/ventas. La mecanica (debounce, descarte
 * de respuestas viejas, refresco) vive en `useListaPaginada`; aca solo estan las reglas propias de los filtros.
 */
export function useListaHistorial() {
  const lista = useListaPaginada(OPCIONES_LISTA_HISTORIAL, FILTROS_HISTORIAL_VACIOS)

  // --- CALCULOS ---
  const calcularConsulta = (): ConsultaLista => {
    const { consulta } = lista
    if (consulta.fase === 'cargando') return consulta
    if (consulta.fase === 'error') {
      return {
        fase: 'error',
        mensaje: traducirErrorConsulta(consulta.error, 'el historial', 'ver el historial'),
      }
    }
    return { fase: 'lista', ...consulta.pagina }
  }

  // --- ACCIONES ---
  const cambiarFiltros = (cambios: Partial<FiltrosHistorial>) => {
    const siguientes = { ...lista.filtros, ...cambios }
    // Un fiado no tiene pagos: sin medio de pago. Y la busqueda por cliente solo existe para los fiados
    const normalizados =
      siguientes.estado === 'PENDIENTE_PAGO'
        ? { ...siguientes, medioPago: null }
        : { ...siguientes, textoCliente: '' }
    lista.establecerFiltros(corregirRangoFechas(normalizados, cambios))
  }

  return {
    filtros: lista.filtros,
    pagina: lista.pagina,
    consulta: calcularConsulta(),
    /** Hay filtros aplicados en la consulta vigente: distingue "sin ventas" de "sin resultados". */
    hayFiltrosActivosEnConsulta: contarFiltrosActivos(lista.filtrosConsulta) > 0,
    cambiarFiltros,
    seleccionarPeriodoRapido: (periodo: PeriodoRapido) =>
      cambiarFiltros(calcularPeriodoRapido(periodo, new Date())),
    limpiarFiltros: lista.limpiarFiltros,
    cambiarPagina: lista.cambiarPagina,
    /** Repite la consulta mostrando "cargando" (despues de un error). */
    reintentar: lista.reintentar,
    /** Repite la consulta de la pagina actual sin mostrar "cargando" (despues de anular o cobrar). */
    refrescar: lista.refrescar,
  }
}
