import { useEffect, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import {
  consultarHistorialApi,
  type PaginaHistorialConsultada,
} from '@/features/ventas/api/consultar-historial-api'
import { ESPERA_FILTROS_TEXTO_MILISEGUNDOS } from '@/features/ventas/config/plazo-modificacion'
import { CANTIDAD_POR_PAGINA_HISTORIAL } from '@/features/ventas/config/reglas-venta'
import type {
  FiltrosHistorial,
  PaginacionHistorial,
  PeriodoRapido,
  VentaHistorial,
} from '@/features/ventas/types/historial'
import { calcularPeriodoRapido } from '@/features/ventas/utils/calcular-periodo-rapido'
import { contarFiltrosActivos, FILTROS_HISTORIAL_VACIOS } from '@/features/ventas/utils/contar-filtros-activos'
import { corregirRangoFechas } from '@/features/ventas/utils/corregir-rango-fechas'
import { traducirErrorConsulta } from '@/features/ventas/utils/traducir-error-venta'
import type { ResultadoApi } from '@/lib/cliente-http.types'

/** Estado de la consulta de la lista, antes de evaluar los plazos contra la hora del servidor. */
export type ConsultaLista =
  | { fase: 'cargando' }
  | { fase: 'error'; mensaje: string }
  | {
      fase: 'lista'
      ventas: VentaHistorial[]
      paginacion: PaginacionHistorial
      desfaseServidorMilisegundos: number
    }

interface CargaLista {
  /** Identifica a que consulta (pagina, filtros y reintento) pertenece. */
  clave: string
  resultado: ResultadoApi<PaginaHistorialConsultada>
}

function crearClaveConsulta(pagina: number, filtros: FiltrosHistorial, numeroReintento: number) {
  return `${numeroReintento}|${pagina}|${JSON.stringify(filtros)}`
}

/**
 * Lista paginada del Historial: filtros, pagina y consulta a GET /api/ventas. Descarta la respuesta de una
 * consulta vieja si el usuario cambio filtros o pagina mientras cargaba. Despues de una accion, `refrescar`
 * vuelve a pedir la pagina actual sin mostrar "cargando": la verdad la tiene el servidor.
 */
export function useListaHistorial() {
  const { cliente } = useSesion()

  // --- ESTADOS ---
  // "filtros" es lo que tipea el usuario; "filtrosConsulta" es lo que se consulta (con espera en los campos de texto)
  const [filtros, setFiltros] = useState<FiltrosHistorial>(FILTROS_HISTORIAL_VACIOS)
  const [filtrosConsulta, setFiltrosConsulta] = useState<FiltrosHistorial>(FILTROS_HISTORIAL_VACIOS)
  const [pagina, setPagina] = useState(1)
  const [numeroReintento, setNumeroReintento] = useState(0)
  const [numeroRefresco, setNumeroRefresco] = useState(0)
  const [carga, setCarga] = useState<CargaLista | null>(null)

  // --- EFECTOS ---
  // Aplica los filtros: el texto espera a que el usuario deje de tipear; el resto, al instante
  useEffect(() => {
    const hayTextoPendiente =
      filtros.textoCliente !== filtrosConsulta.textoCliente ||
      filtros.numeroComprobante !== filtrosConsulta.numeroComprobante
    const temporizador = setTimeout(
      () => {
        if (filtros === filtrosConsulta) return
        setFiltrosConsulta(filtros)
        // Una busqueda nueva siempre arranca en la primera pagina
        setPagina(1)
      },
      hayTextoPendiente ? ESPERA_FILTROS_TEXTO_MILISEGUNDOS : 0,
    )
    return () => clearTimeout(temporizador)
  }, [filtros, filtrosConsulta])

  // Consulta la pagina. "vigente" descarta la respuesta si ya cambio la consulta
  useEffect(() => {
    let vigente = true
    const clave = crearClaveConsulta(pagina, filtrosConsulta, numeroReintento)
    void consultarHistorialApi(cliente, filtrosConsulta, pagina, CANTIDAD_POR_PAGINA_HISTORIAL).then(
      (resultado) => {
        if (!vigente) return
        // Pagina fuera de rango (por ejemplo tras anular la unica venta de la ultima): salta a la ultima
        if (
          resultado.exitoso &&
          resultado.datos.ventas.length === 0 &&
          resultado.datos.paginacion.totalPaginas > 0 &&
          pagina > resultado.datos.paginacion.totalPaginas
        ) {
          setPagina(resultado.datos.paginacion.totalPaginas)
          return
        }
        setCarga((actual) =>
          // Si un refresco silencioso falla, se conserva la lista que ya se estaba mostrando
          !resultado.exitoso && actual?.clave === clave && actual.resultado.exitoso
            ? actual
            : { clave, resultado },
        )
      },
    )
    return () => {
      vigente = false
    }
  }, [cliente, filtrosConsulta, pagina, numeroReintento, numeroRefresco])

  // --- CALCULOS ---
  const claveActual = crearClaveConsulta(pagina, filtrosConsulta, numeroReintento)
  const calcularConsulta = (): ConsultaLista => {
    if (carga === null || carga.clave !== claveActual) return { fase: 'cargando' }
    if (!carga.resultado.exitoso) {
      return {
        fase: 'error',
        mensaje: traducirErrorConsulta(carga.resultado.error, 'el historial', 'ver el historial'),
      }
    }
    return { fase: 'lista', ...carga.resultado.datos }
  }

  // --- ACCIONES ---
  const cambiarFiltros = (cambios: Partial<FiltrosHistorial>) => {
    const siguientes = { ...filtros, ...cambios }
    // Un fiado no tiene pagos: sin medio de pago. Y la busqueda por cliente solo existe para los fiados
    const normalizados =
      siguientes.estado === 'PENDIENTE_PAGO'
        ? { ...siguientes, medioPago: null }
        : { ...siguientes, textoCliente: '' }
    setFiltros(corregirRangoFechas(normalizados, cambios))
  }

  return {
    filtros,
    pagina,
    consulta: calcularConsulta(),
    /** Hay filtros aplicados en la consulta vigente: distingue "sin ventas" de "sin resultados". */
    hayFiltrosActivosEnConsulta: contarFiltrosActivos(filtrosConsulta) > 0,
    cambiarFiltros,
    seleccionarPeriodoRapido: (periodo: PeriodoRapido) =>
      cambiarFiltros(calcularPeriodoRapido(periodo, new Date())),
    limpiarFiltros: () => setFiltros(FILTROS_HISTORIAL_VACIOS),
    cambiarPagina: setPagina,
    /** Repite la consulta mostrando "cargando" (despues de un error). */
    reintentar: () => setNumeroReintento((actual) => actual + 1),
    /** Repite la consulta de la pagina actual sin mostrar "cargando" (despues de anular o cobrar). */
    refrescar: () => setNumeroRefresco((actual) => actual + 1),
  }
}
