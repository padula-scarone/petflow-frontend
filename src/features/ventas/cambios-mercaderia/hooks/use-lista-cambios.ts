import {
  consultarCambiosApi,
  type PaginaCambiosConsultada,
} from '@/features/ventas/cambios-mercaderia/api/consultar-cambios-api'
import type {
  CambioMercaderiaListado,
  FiltrosCambios,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import {
  contarFiltrosActivosCambios,
  FILTROS_CAMBIOS_VACIOS,
} from '@/features/ventas/cambios-mercaderia/utils/contar-filtros-cambios'
import { CANTIDAD_POR_PAGINA_HISTORIAL } from '@/features/ventas/config/reglas-venta'
import { useListaPaginada, type OpcionesListaPaginada } from '@/features/ventas/hooks/use-lista-paginada'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'
import type { PeriodoRapido } from '@/features/ventas/types/historial'
import { calcularPeriodoRapido } from '@/features/ventas/utils/calcular-periodo-rapido'
import { corregirRangoFechas } from '@/features/ventas/utils/corregir-rango-fechas'
import { traducirErrorConsulta } from '@/features/ventas/utils/traducir-error-venta'

/** Estado de la consulta de la lista, antes de evaluar los plazos contra la hora del servidor. */
export type ConsultaListaCambios =
  | { fase: 'cargando' }
  | { fase: 'error'; mensaje: string }
  | {
      fase: 'lista'
      cambios: CambioMercaderiaListado[]
      paginacion: PaginacionResultados
      desfaseServidorMilisegundos: number
    }

// Funciones de modulo: el hook las usa dentro de efectos y necesitan identidad estable
const OPCIONES_LISTA_CAMBIOS: OpcionesListaPaginada<FiltrosCambios, PaginaCambiosConsultada> = {
  // Misma cantidad por pagina que el Historial (el valor por defecto del back)
  consultar: (cliente, filtros, pagina) =>
    consultarCambiosApi(cliente, filtros, pagina, CANTIDAD_POR_PAGINA_HISTORIAL),
  contarElementos: (pagina) => pagina.cambios.length,
  // Ningun filtro de Cambios es de texto: todos se aplican al instante
  hayTextoPendiente: () => false,
}

/**
 * Lista paginada de Cambios posventa: filtros, pagina y consulta a GET /api/cambios-mercaderia. La mecanica
 * (descarte de respuestas viejas, salto a la ultima pagina, refresco) vive en `useListaPaginada`.
 */
export function useListaCambios() {
  const lista = useListaPaginada(OPCIONES_LISTA_CAMBIOS, FILTROS_CAMBIOS_VACIOS)

  // --- CALCULOS ---
  const calcularConsulta = (): ConsultaListaCambios => {
    const { consulta } = lista
    if (consulta.fase === 'cargando') return consulta
    if (consulta.fase === 'error') {
      return {
        fase: 'error',
        mensaje: traducirErrorConsulta(consulta.error, 'los cambios', 'ver los cambios'),
      }
    }
    return { fase: 'lista', ...consulta.pagina }
  }

  // --- ACCIONES ---
  const cambiarFiltros = (cambios: Partial<FiltrosCambios>) =>
    lista.establecerFiltros(corregirRangoFechas({ ...lista.filtros, ...cambios }, cambios))

  return {
    filtros: lista.filtros,
    pagina: lista.pagina,
    consulta: calcularConsulta(),
    /** Hay filtros aplicados en la consulta vigente: distingue "sin cambios" de "sin resultados". */
    hayFiltrosActivosEnConsulta: contarFiltrosActivosCambios(lista.filtrosConsulta) > 0,
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
