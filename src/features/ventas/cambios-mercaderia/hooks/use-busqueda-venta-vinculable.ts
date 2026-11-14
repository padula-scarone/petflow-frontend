import { useRef, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { consultarVentaApi } from '@/features/ventas/api/consultar-venta-api'
import {
  consultarHistorialApi,
  type PaginaHistorialConsultada,
} from '@/features/ventas/api/consultar-historial-api'
import { convertirDetalleApiAVentaVinculada } from '@/features/ventas/cambios-mercaderia/api/convertir-detalle-api-a-venta-vinculada'
import {
  MENSAJE_ALTA_CAMBIO_VENTA_INEXISTENTE,
  MENSAJE_ALTA_CAMBIO_VENTA_NO_VINCULABLE,
  MENSAJE_DETALLE_CAMBIO_ILEGIBLE,
} from '@/features/ventas/cambios-mercaderia/config/mensajes-error-cambio'
import {
  CANTIDAD_VENTAS_POR_PAGINA_BUSQUEDA,
  ESTADOS_VENTA_VINCULABLES,
  esVentaVinculable,
} from '@/features/ventas/cambios-mercaderia/config/reglas-cambios'
import type {
  EstadoBusquedaVenta,
  FiltrosBusquedaVenta,
  PropiedadesBusquedaVenta,
  VentaVinculada,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import {
  FILTROS_BUSQUEDA_VENTA_VACIOS,
} from '@/features/ventas/cambios-mercaderia/utils/estados-iniciales-cambio'
import { crearErrorAccionCambio } from '@/features/ventas/cambios-mercaderia/utils/traducir-error-cambio'
import { useListaPaginada, type OpcionesListaPaginada } from '@/features/ventas/hooks/use-lista-paginada'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type { FiltrosHistorial, PeriodoRapido, ProductoFiltro } from '@/features/ventas/types/historial'
import type { ProductoCatalogo } from '@/features/ventas/types/venta'
import { calcularPeriodoRapido } from '@/features/ventas/utils/calcular-periodo-rapido'
import { corregirRangoFechas } from '@/features/ventas/utils/corregir-rango-fechas'
import { detectarPeriodoRapido } from '@/features/ventas/utils/detectar-periodo-rapido'
import { filtrarProductosCatalogo } from '@/features/ventas/utils/filtrar-productos-catalogo'
import { clasificarFalloAccion } from '@/features/ventas/utils/traducir-error-accion-venta'
import { traducirErrorConsulta } from '@/features/ventas/utils/traducir-error-venta'

/** Pasa los filtros de la busqueda a los del Historial: siempre solo ventas vinculables y sin busqueda por cliente. */
function convertirFiltrosAHistorial(filtros: FiltrosBusquedaVenta): FiltrosHistorial {
  return { ...filtros, estado: ESTADOS_VENTA_VINCULABLES[0], textoCliente: '' }
}

// Funciones de modulo: el hook las usa dentro de efectos y necesitan identidad estable
const OPCIONES_BUSQUEDA_VENTA: OpcionesListaPaginada<FiltrosBusquedaVenta, PaginaHistorialConsultada> = {
  consultar: (cliente, filtros, pagina) =>
    consultarHistorialApi(cliente, convertirFiltrosAHistorial(filtros), pagina, CANTIDAD_VENTAS_POR_PAGINA_BUSQUEDA),
  contarElementos: (pagina) => pagina.ventas.length,
  hayTextoPendiente: (escritos, consultados) => escritos.numeroComprobante !== consultados.numeroComprobante,
}

const SIN_REFERENCIA = { estadoHttp: null, codigo: null } as const

/** Lo que necesita la busqueda de la venta a vincular. */
interface OpcionesBusquedaVenta {
  medios: MedioPago[]
  /** Catalogo de productos: de ahi salen el buscador de producto y los datos de bolsa abierta de la venta. */
  catalogo: ProductoCatalogo[] | null
  /** Se llama con la venta ya cargada cuando el usuario toca "Vincular". */
  alVincularVenta: (venta: VentaVinculada) => void
}

/**
 * Busqueda de la venta a vincular en el alta de un cambio: GET /api/ventas con `estado=COMPLETADA` siempre (no se
 * vinculan fiados ni ventas anuladas) y, al tocar "Vincular", GET /api/ventas/:idVenta. Si la venta ya no esta
 * COMPLETADA, no se vincula.
 */
export function useBusquedaVentaVinculable({ medios, catalogo, alVincularVenta }: OpcionesBusquedaVenta) {
  const { cliente } = useSesion()
  const lista = useListaPaginada(OPCIONES_BUSQUEDA_VENTA, FILTROS_BUSQUEDA_VENTA_VACIOS)

  // --- ESTADOS ---
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState('')
  const [idVentaVinculando, setIdVentaVinculando] = useState<number | null>(null)
  const [errorVinculacion, setErrorVinculacion] = useState<PropiedadesBusquedaVenta['errorVinculacion']>(null)
  // Un ref y no un estado: un segundo toque puede llegar antes del siguiente render
  const vinculandoRef = useRef(false)

  // --- CALCULOS ---
  const calcularEstado = (): EstadoBusquedaVenta => {
    const { consulta } = lista
    if (consulta.fase === 'cargando') return { tipo: 'cargando' }
    if (consulta.fase === 'error') {
      return { tipo: 'error', mensaje: traducirErrorConsulta(consulta.error, 'las ventas', 'ver las ventas') }
    }
    if (consulta.pagina.ventas.length === 0) return { tipo: 'sin-resultados' }
    return { tipo: 'con-resultados', ventas: consulta.pagina.ventas, paginacion: consulta.pagina.paginacion }
  }

  // El catalogo ya esta cargado en el dispositivo: no hay un pedido por tecla
  const productosCoincidentes = filtrarProductosCatalogo(catalogo ?? [], textoBusquedaProducto)

  // --- ACCIONES ---
  const buscarVenta = (cambios: Partial<FiltrosBusquedaVenta>) => {
    setErrorVinculacion(null)
    lista.establecerFiltros(corregirRangoFechas({ ...lista.filtros, ...cambios }, cambios))
  }

  const seleccionarProducto = (producto: ProductoFiltro | null) => {
    buscarVenta({ productoSeleccionado: producto })
    setTextoBusquedaProducto('')
  }

  const limpiarFiltros = () => {
    setErrorVinculacion(null)
    lista.limpiarFiltros()
    setTextoBusquedaProducto('')
  }

  /** Trae el detalle de la venta elegida y avisa cuando esta lista; si ya no se puede vincular, lo informa. */
  const vincularVenta = async (idVenta: number) => {
    if (vinculandoRef.current || catalogo === null) return
    vinculandoRef.current = true
    setErrorVinculacion(null)
    setIdVentaVinculando(idVenta)
    try {
      const respuesta = await consultarVentaApi(cliente, String(idVenta))
      if (!respuesta.exitoso) {
        // 401: el cliente HTTP ya cerro la sesion
        if (clasificarFalloAccion(respuesta.error) === 'sin-sesion') return
        setErrorVinculacion(
          respuesta.error.estado === 404
            ? crearErrorAccionCambio({ estadoHttp: 404, codigo: 'VENTA_NO_ENCONTRADA' }, MENSAJE_ALTA_CAMBIO_VENTA_INEXISTENTE, {
                reintentable: false,
              })
            : crearErrorAccionCambio(
                SIN_REFERENCIA,
                traducirErrorConsulta(respuesta.error, 'la venta', 'ver la venta'),
              ),
        )
        return
      }
      const venta = convertirDetalleApiAVentaVinculada(respuesta.datos.venta, medios, catalogo)
      if (venta === null) {
        setErrorVinculacion(crearErrorAccionCambio(SIN_REFERENCIA, MENSAJE_DETALLE_CAMBIO_ILEGIBLE))
        return
      }
      // La lista pudo quedar vieja: si la venta cambio de estado, se avisa y se vuelve a pedir la lista
      if (!esVentaVinculable(venta.estado)) {
        setErrorVinculacion(
          crearErrorAccionCambio(
            { estadoHttp: 409, codigo: 'VENTA_NO_VINCULABLE' },
            MENSAJE_ALTA_CAMBIO_VENTA_NO_VINCULABLE,
            { reintentable: false },
          ),
        )
        lista.refrescar()
        return
      }
      alVincularVenta(venta)
    } finally {
      vinculandoRef.current = false
      setIdVentaVinculando(null)
    }
  }

  const propiedadesBusquedaVenta: PropiedadesBusquedaVenta = {
    filtros: lista.filtros,
    opciones: {
      mediosPago: medios.map(({ idMedioPago, nombre }) => ({ idMedioPago, nombre })),
      textoBusquedaProducto,
      productosCoincidentes,
    },
    periodoRapidoActivo: detectarPeriodoRapido(lista.filtros.fechaDesde, lista.filtros.fechaHasta, new Date()),
    estado: calcularEstado(),
    idVentaVinculando,
    errorVinculacion,
    onBuscarVenta: buscarVenta,
    onSeleccionarPeriodoRapido: (periodo: PeriodoRapido) => buscarVenta(calcularPeriodoRapido(periodo, new Date())),
    onBuscarProducto: setTextoBusquedaProducto,
    onSeleccionarProducto: seleccionarProducto,
    onLimpiarFiltros: limpiarFiltros,
    onCambiarPaginaBusqueda: lista.cambiarPagina,
    onReintentarBusqueda: lista.reintentar,
    onVincularVenta: (idVenta) => void vincularVenta(idVenta),
  }

  return propiedadesBusquedaVenta
}
