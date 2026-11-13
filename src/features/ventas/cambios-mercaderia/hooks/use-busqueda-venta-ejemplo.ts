import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  CANTIDAD_VENTAS_POR_PAGINA_BUSQUEDA,
  LATENCIA_BUSQUEDA_VENTA_MILISEGUNDOS,
  LATENCIA_DETALLE_CAMBIO_MILISEGUNDOS,
} from '@/features/ventas/cambios-mercaderia/config/simulacion-cambios'
import type {
  CambioMercaderiaDetalle,
  EstadoBusquedaVenta,
  FiltrosBusquedaVenta,
  PropiedadesBusquedaVenta,
  VentaVinculable,
  VentaVinculada,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import {
  buscarVentasVinculablesEjemplo,
  construirVentaVinculada,
} from '@/features/ventas/cambios-mercaderia/utils/buscar-ventas-vinculables-ejemplo'
import {
  FILTROS_BUSQUEDA_VENTA_VACIOS,
} from '@/features/ventas/cambios-mercaderia/utils/estados-iniciales-cambio'
import { ESPERA_FILTROS_TEXTO_MILISEGUNDOS } from '@/features/ventas/config/plazo-modificacion'
import { MEDIOS_EJEMPLO } from '@/features/ventas/hooks/use-cobro-venta-ejemplo'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'
import type { PeriodoRapido, ProductoFiltro, VentaDetalle } from '@/features/ventas/types/historial'
import { calcularPeriodoRapido } from '@/features/ventas/utils/calcular-periodo-rapido'
import { corregirRangoFechas } from '@/features/ventas/utils/corregir-rango-fechas'
import { detectarPeriodoRapido } from '@/features/ventas/utils/detectar-periodo-rapido'
import { buscarProductosCambioEjemplo } from '@/features/ventas/cambios-mercaderia/utils/catalogo-cambios-ejemplo'

// Hook temporal: simula el GET /api/ventas (filtrado a COMPLETADA) y el GET /api/ventas/:idVenta del alta.
// Estados de la busqueda: agregar ?vistaBusqueda=cargando, ?vistaBusqueda=error o ?vistaBusqueda=sin-resultados.

interface ResultadoBusqueda {
  /** Identifica a que consulta pertenece; si no coincide con la actual, se esta cargando. */
  clave: string
  ventas: VentaVinculable[]
  paginacion: PaginacionResultados
}

function crearClaveConsulta(numeroReintento: number, pagina: number, filtros: FiltrosBusquedaVenta) {
  return `${numeroReintento}|${pagina}|${JSON.stringify(filtros)}`
}

interface ParametrosBusquedaVenta {
  ventas: VentaDetalle[]
  cambios: CambioMercaderiaDetalle[]
  /** Se llama con la venta ya cargada cuando el usuario toca "Vincular". */
  onVentaVinculada: (venta: VentaVinculada) => void
}

export function useBusquedaVentaEjemplo({ ventas, cambios, onVentaVinculada }: ParametrosBusquedaVenta) {
  // --- ESTADOS ---
  // "filtros" es lo que tipea el usuario; "filtrosConsulta" es lo que se consulta (con debounce en el texto)
  const [filtros, setFiltros] = useState<FiltrosBusquedaVenta>(FILTROS_BUSQUEDA_VENTA_VACIOS)
  const [filtrosConsulta, setFiltrosConsulta] = useState<FiltrosBusquedaVenta>(FILTROS_BUSQUEDA_VENTA_VACIOS)
  const [pagina, setPagina] = useState(1)
  const [numeroReintento, setNumeroReintento] = useState(0)
  const [resultado, setResultado] = useState<ResultadoBusqueda | null>(null)
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState('')
  const [idVentaVinculando, setIdVentaVinculando] = useState<number | null>(null)
  const [errorVinculacion, setErrorVinculacion] = useState<PropiedadesBusquedaVenta['errorVinculacion']>(null)
  const [ahoraInicial] = useState(() => Date.now())
  const [parametrosBusqueda] = useSearchParams()

  // --- EFECTOS ---
  // Aplica los filtros: el texto espera a que el usuario deje de tipear; el resto, al instante
  useEffect(() => {
    const hayTextoPendiente = filtros.numeroComprobante !== filtrosConsulta.numeroComprobante
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

  // Simula el GET /api/ventas con su latencia
  useEffect(() => {
    const clave = crearClaveConsulta(numeroReintento, pagina, filtrosConsulta)
    const temporizador = setTimeout(() => {
      setResultado({
        clave,
        ...buscarVentasVinculablesEjemplo(ventas, cambios, filtrosConsulta, pagina, CANTIDAD_VENTAS_POR_PAGINA_BUSQUEDA),
      })
    }, LATENCIA_BUSQUEDA_VENTA_MILISEGUNDOS)
    return () => clearTimeout(temporizador)
  }, [ventas, cambios, filtrosConsulta, pagina, numeroReintento])

  // --- CALCULOS ---
  const consultaVigente =
    resultado !== null && resultado.clave === crearClaveConsulta(numeroReintento, pagina, filtrosConsulta)
  const vistaForzada = parametrosBusqueda.get('vistaBusqueda')

  const estado: EstadoBusquedaVenta = (() => {
    if (vistaForzada === 'cargando') return { tipo: 'cargando' }
    if (vistaForzada === 'error') {
      return { tipo: 'error', mensaje: 'No pudimos buscar las ventas. Revisá tu conexión e intentá de nuevo.' }
    }
    if (vistaForzada === 'sin-resultados') return { tipo: 'sin-resultados' }
    if (resultado === null || !consultaVigente) return { tipo: 'cargando' }
    if (resultado.ventas.length === 0) return { tipo: 'sin-resultados' }
    return { tipo: 'con-resultados', ventas: resultado.ventas, paginacion: resultado.paginacion }
  })()

  const textoProductoNormalizado = textoBusquedaProducto.trim().toLowerCase()
  const productosCoincidentes: ProductoFiltro[] =
    textoProductoNormalizado === ''
      ? []
      : buscarProductosCambioEjemplo(textoProductoNormalizado).map(({ idProducto, nombreProducto }) => ({
          idProducto,
          nombreProducto,
        }))

  // --- ACCIONES ---
  const buscarVenta = (cambios: Partial<FiltrosBusquedaVenta>) => {
    setErrorVinculacion(null)
    setFiltros(corregirRangoFechas({ ...filtros, ...cambios }, cambios))
  }

  const seleccionarProducto = (producto: ProductoFiltro | null) => {
    buscarVenta({ productoSeleccionado: producto })
    setTextoBusquedaProducto('')
  }

  const limpiarFiltros = () => {
    setErrorVinculacion(null)
    setFiltros(FILTROS_BUSQUEDA_VENTA_VACIOS)
    setTextoBusquedaProducto('')
  }

  /** Trae el detalle de la venta elegida (GET /api/ventas/:idVenta) y avisa cuando esta lista. */
  const vincularVenta = (idVenta: number) => {
    setErrorVinculacion(null)
    setIdVentaVinculando(idVenta)
    setTimeout(() => {
      const venta = ventas.find((candidata) => candidata.idVenta === idVenta)
      setIdVentaVinculando(null)
      if (!venta) {
        setErrorVinculacion({
          estadoHttp: 404,
          codigo: 'VENTA_NO_ENCONTRADA',
          mensaje: 'No encontramos esa venta. Actualizá la búsqueda e intentá con otra.',
        })
        return
      }
      onVentaVinculada(construirVentaVinculada(venta, cambios))
    }, LATENCIA_DETALLE_CAMBIO_MILISEGUNDOS)
  }

  const propiedadesBusquedaVenta: PropiedadesBusquedaVenta = {
    filtros,
    opciones: {
      mediosPago: MEDIOS_EJEMPLO.map(({ idMedioPago, nombre }) => ({ idMedioPago, nombre })),
      textoBusquedaProducto,
      productosCoincidentes,
    },
    periodoRapidoActivo: detectarPeriodoRapido(filtros.fechaDesde, filtros.fechaHasta, new Date(ahoraInicial)),
    estado,
    idVentaVinculando,
    errorVinculacion,
    onBuscarVenta: buscarVenta,
    onSeleccionarPeriodoRapido: (periodo: PeriodoRapido) =>
      buscarVenta(calcularPeriodoRapido(periodo, new Date())),
    onBuscarProducto: setTextoBusquedaProducto,
    onSeleccionarProducto: seleccionarProducto,
    onLimpiarFiltros: limpiarFiltros,
    onCambiarPaginaBusqueda: setPagina,
    onReintentarBusqueda: () => setNumeroReintento(numeroReintento + 1),
    onVincularVenta: vincularVenta,
  }

  return propiedadesBusquedaVenta
}
