import { useEffect, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { ESPERA_FILTROS_TEXTO_MILISEGUNDOS } from '@/features/ventas/config/plazo-modificacion'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'
import type { ClienteHttp, ErrorApi, ResultadoApi } from '@/lib/cliente-http.types'

/** Lo que toda pagina consultada tiene en comun: sus metadatos de paginacion. */
interface PaginaConsultada {
  paginacion: PaginacionResultados
}

/**
 * Como se conecta cada lista (Historial de ventas, Cambios posventa) con el hook. Las tres funciones se usan
 * dentro de un efecto: deben ser estables (definidas a nivel de modulo, no dentro del componente).
 */
export interface OpcionesListaPaginada<Filtros, Pagina extends PaginaConsultada> {
  /** Pide una pagina al back con los filtros ya aplicados. */
  consultar: (cliente: ClienteHttp, filtros: Filtros, pagina: number) => Promise<ResultadoApi<Pagina>>
  /** Cuantos elementos trae la pagina: con 0 y una pagina fuera de rango, la lista salta a la ultima. */
  contarElementos: (pagina: Pagina) => number
  /** true si cambio un filtro de texto: ese espera a que el usuario deje de tipear. */
  hayTextoPendiente: (escritos: Filtros, consultados: Filtros) => boolean
}

/** Estado de la consulta de la lista. */
export type ConsultaPaginada<Pagina> =
  | { fase: 'cargando' }
  | { fase: 'error'; error: ErrorApi }
  | { fase: 'lista'; pagina: Pagina }

interface CargaLista<Pagina> {
  /** Identifica a que consulta (pagina, filtros y reintento) pertenece. */
  clave: string
  resultado: ResultadoApi<Pagina>
}

function crearClaveConsulta<Filtros>(pagina: number, filtros: Filtros, numeroReintento: number) {
  return `${numeroReintento}|${pagina}|${JSON.stringify(filtros)}`
}

/**
 * Lista paginada con filtros contra el back: lleva filtros, pagina y consulta. Descarta la respuesta de una
 * consulta vieja si el usuario cambio filtros o pagina mientras cargaba. Despues de una accion, `refrescar`
 * vuelve a pedir la pagina actual sin mostrar "cargando": la verdad la tiene el servidor.
 */
export function useListaPaginada<Filtros, Pagina extends PaginaConsultada>(
  opciones: OpcionesListaPaginada<Filtros, Pagina>,
  filtrosVacios: Filtros,
) {
  const { cliente } = useSesion()
  const { consultar, contarElementos, hayTextoPendiente } = opciones

  // --- ESTADOS ---
  // "filtros" es lo que tipea el usuario; "filtrosConsulta" es lo que se consulta (con espera en los campos de texto)
  const [filtros, setFiltros] = useState<Filtros>(filtrosVacios)
  const [filtrosConsulta, setFiltrosConsulta] = useState<Filtros>(filtrosVacios)
  const [pagina, setPagina] = useState(1)
  const [numeroReintento, setNumeroReintento] = useState(0)
  const [numeroRefresco, setNumeroRefresco] = useState(0)
  const [carga, setCarga] = useState<CargaLista<Pagina> | null>(null)

  // --- EFECTOS ---
  // Aplica los filtros: el texto espera a que el usuario deje de tipear; el resto, al instante
  useEffect(() => {
    const temporizador = setTimeout(
      () => {
        if (filtros === filtrosConsulta) return
        setFiltrosConsulta(filtros)
        // Una busqueda nueva siempre arranca en la primera pagina
        setPagina(1)
      },
      hayTextoPendiente(filtros, filtrosConsulta) ? ESPERA_FILTROS_TEXTO_MILISEGUNDOS : 0,
    )
    return () => clearTimeout(temporizador)
  }, [filtros, filtrosConsulta, hayTextoPendiente])

  // Consulta la pagina. "vigente" descarta la respuesta si ya cambio la consulta
  useEffect(() => {
    let vigente = true
    const clave = crearClaveConsulta(pagina, filtrosConsulta, numeroReintento)
    void consultar(cliente, filtrosConsulta, pagina).then((resultado) => {
      if (!vigente) return
      // Pagina fuera de rango (por ejemplo tras anular el unico elemento de la ultima): salta a la ultima
      if (
        resultado.exitoso &&
        contarElementos(resultado.datos) === 0 &&
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
    })
    return () => {
      vigente = false
    }
  }, [cliente, consultar, contarElementos, filtrosConsulta, pagina, numeroReintento, numeroRefresco])

  // --- CALCULOS ---
  const claveActual = crearClaveConsulta(pagina, filtrosConsulta, numeroReintento)
  const calcularConsulta = (): ConsultaPaginada<Pagina> => {
    if (carga === null || carga.clave !== claveActual) return { fase: 'cargando' }
    if (!carga.resultado.exitoso) return { fase: 'error', error: carga.resultado.error }
    return { fase: 'lista', pagina: carga.resultado.datos }
  }

  return {
    filtros,
    filtrosConsulta,
    pagina,
    consulta: calcularConsulta(),
    establecerFiltros: setFiltros,
    limpiarFiltros: () => setFiltros(filtrosVacios),
    cambiarPagina: setPagina,
    /** Repite la consulta mostrando "cargando" (despues de un error). */
    reintentar: () => setNumeroReintento((actual) => actual + 1),
    /** Repite la consulta de la pagina actual sin mostrar "cargando" (despues de anular, cobrar o registrar). */
    refrescar: () => setNumeroRefresco((actual) => actual + 1),
  }
}
