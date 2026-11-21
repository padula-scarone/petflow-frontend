import {
  consultarDevolucionesApi,
  type PaginaDevolucionesConsultada,
} from '@/features/ventas/devoluciones/api/consultar-devoluciones-api'
import type {
  DevolucionListado,
  FiltrosDevoluciones,
} from '@/features/ventas/devoluciones/types/devolucion'
import {
  contarFiltrosActivosDevoluciones,
  FILTROS_DEVOLUCIONES_VACIAS,
} from '@/features/ventas/devoluciones/utils/contar-filtros-devoluciones'
import { CANTIDAD_POR_PAGINA_HISTORIAL } from '@/features/ventas/config/reglas-venta'
import { useListaPaginada, type OpcionesListaPaginada } from '@/features/ventas/hooks/use-lista-paginada'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'
import type { PeriodoRapido } from '@/features/ventas/types/historial'
import { calcularPeriodoRapido } from '@/features/ventas/utils/calcular-periodo-rapido'
import { corregirRangoFechas } from '@/features/ventas/utils/corregir-rango-fechas'
import { traducirErrorConsulta } from '@/features/ventas/utils/traducir-error-venta'

/** Estado de la consulta de la lista, antes de evaluar los plazos contra la hora del servidor. */
export type ConsultaListaDevoluciones =
  | { fase: 'cargando' }
  | { fase: 'error'; mensaje: string }
  | {
      fase: 'lista'
      devoluciones: DevolucionListado[]
      paginacion: PaginacionResultados
      desfaseServidorMilisegundos: number
    }

// Funciones de modulo: el hook las usa dentro de efectos y necesitan identidad estable
const OPCIONES_LISTA_DEVOLUCIONES: OpcionesListaPaginada<FiltrosDevoluciones, PaginaDevolucionesConsultada> = {
  // Misma cantidad por pagina que el Historial (el valor por defecto del back)
  consultar: (cliente, filtros, pagina) =>
    consultarDevolucionesApi(cliente, filtros, pagina, CANTIDAD_POR_PAGINA_HISTORIAL),
  contarElementos: (pagina) => pagina.devoluciones.length,
  // Ningun filtro de Devoluciones es de texto: todos se aplican al instante
  hayTextoPendiente: () => false,
}

/**
 * Lista paginada de Devoluciones: filtros, pagina y consulta a GET /api/cambios-mercaderia. La mecanica
 * (descarte de respuestas viejas, salto a la ultima pagina, refresco) vive en `useListaPaginada`.
 */
export function useListaDevoluciones() {
  const lista = useListaPaginada(OPCIONES_LISTA_DEVOLUCIONES, FILTROS_DEVOLUCIONES_VACIAS)

  // --- CALCULOS ---
  const calcularConsulta = (): ConsultaListaDevoluciones => {
    const { consulta } = lista
    if (consulta.fase === 'cargando') return consulta
    if (consulta.fase === 'error') {
      return {
        fase: 'error',
        mensaje: traducirErrorConsulta(consulta.error, 'las devoluciones', 'ver las devoluciones'),
      }
    }
    return { fase: 'lista', ...consulta.pagina }
  }

  // --- ACCIONES ---
  const cambiarFiltros = (cambios: Partial<FiltrosDevoluciones>) =>
    lista.establecerFiltros(corregirRangoFechas({ ...lista.filtros, ...cambios }, cambios))

  return {
    filtros: lista.filtros,
    pagina: lista.pagina,
    consulta: calcularConsulta(),
    /** Hay filtros aplicados en la consulta vigente: distingue "sin devoluciones" de "sin resultados". */
    hayFiltrosActivosEnConsulta: contarFiltrosActivosDevoluciones(lista.filtrosConsulta) > 0,
    cambiarFiltros,
    seleccionarPeriodoRapido: (periodo: PeriodoRapido) =>
      cambiarFiltros(calcularPeriodoRapido(periodo, new Date())),
    limpiarFiltros: lista.limpiarFiltros,
    cambiarPagina: lista.cambiarPagina,
    /** Repite la consulta mostrando "cargando" (despues de un error). */
    reintentar: lista.reintentar,
    /** Repite la consulta de la pagina actual sin mostrar "cargando" (despues de anular o registrar). */
    refrescar: lista.refrescar,
  }
}
