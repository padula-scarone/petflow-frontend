import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import {
  CANTIDAD_POR_PAGINA_EJEMPLO,
  ESPERA_FILTROS_TEXTO_MILISEGUNDOS,
  LATENCIA_EJEMPLO_MILISEGUNDOS,
} from '@/features/ventas/config/plazo-modificacion'
import { RUTAS_REGISTRAR_VENTA } from '@/features/ventas/config/rutas-registrar-venta'
import { MEDIOS_EJEMPLO } from '@/features/ventas/hooks/use-cobro-venta-ejemplo'
import { usePlazoModificacionVenta } from '@/features/ventas/hooks/use-plazo-modificacion-venta'
import type {
  AccionVenta,
  AvisoHistorial,
  ConfirmacionAccionVenta,
  EstadoDetalleVenta,
  EstadoListaHistorial,
  FilaHistorial,
  FiltrosHistorial,
  HistorialVentasProps,
  LiquidarFiadoServidor,
  PaginacionHistorial,
  PeriodoRapido,
  ProductoFiltro,
  VentaDetalle,
  VentaHistorial,
} from '@/features/ventas/types/historial'
import { calcularPeriodoRapido } from '@/features/ventas/utils/calcular-periodo-rapido'
import { crearFilaHistorial } from '@/features/ventas/utils/calcular-plazo-modificacion'
import {
  consultarVentasEjemplo,
  obtenerVentaHistorial,
} from '@/features/ventas/utils/consultar-ventas-ejemplo'
import {
  contarFiltrosActivos,
  contarFiltrosAdicionales,
  FILTROS_HISTORIAL_VACIOS,
} from '@/features/ventas/utils/contar-filtros-activos'
import { detectarPeriodoRapido } from '@/features/ventas/utils/detectar-periodo-rapido'
import { crearVentasEjemplo, PRODUCTOS_EJEMPLO } from '@/features/ventas/utils/crear-ventas-ejemplo'
import {
  construirVentaCobrada,
  ID_FIADO_YA_COBRADO,
  simularCobroFiado,
  simularModificacion,
} from '@/features/ventas/utils/simular-servidor-ejemplo'

// --- DATOS DE EJEMPLO ---
// Hook temporal para probar la vista: se reemplaza por el hook real de la accion Consultar Historial.
//
// Ventas con comportamiento fijo (todas con fechas relativas a "ahora"):
//   1047  plazo vigente, sin trampas
//   1046  plazo vigente, pero editar y anular responden 403 (el servidor manda sobre el contador)
//   1045  fiado reciente: se puede cobrar, editar y anular
//   1044  le quedan 30 segundos de plazo: pierde Editar y Anular en vivo, sin recargar
//   1043  fiado de ayer saldado hace 5 minutos: el plazo corre desde el pago
//   (pago mixto: las ventas con 2 medios, como 1043, responden al filtro "Mixto")
//   1042  cobrar responde 409 (ya la cobro otro usuario)
//   1041  cobrar responde 409 (no hay caja abierta)
//   1040  cobrar responde 404 (la venta ya no existe)
//   1039  anulada
//   1038  fiado vencido que se cobra sin problemas
// Estados de la lista: agregar ?vista=cargando, ?vista=error o ?vista=sin-ventas a la URL.

/** Diferencia entre el reloj del servidor y el del dispositivo; en la integracion se calcula por consulta. */
const DESFASE_RELOJ_SERVIDOR_EJEMPLO_MILISEGUNDOS = 0

const LATENCIA_ACCION_MILISEGUNDOS = 700
const LATENCIA_COBRO_MILISEGUNDOS = 800
const LATENCIA_DETALLE_MILISEGUNDOS = 400

/** Ventas de ejemplo con un contador que sube con cada cambio, para disparar una nueva consulta. */
interface BaseVentas {
  version: number
  ventas: VentaDetalle[]
}

interface SolicitudDetalle {
  idVenta: number
  /** Sube en cada pedido, para que reabrir el mismo detalle vuelva a cargarlo. */
  numero: number
}

interface ResultadoConsulta {
  /** Identifica a que consulta pertenece; si no coincide con la actual, se esta cargando. */
  clave: string
  ventas: VentaHistorial[]
  paginacion: PaginacionHistorial
}

function crearClaveConsulta(
  version: number,
  numeroReintento: number,
  pagina: number,
  filtros: FiltrosHistorial,
) {
  return `${version}|${numeroReintento}|${pagina}|${JSON.stringify(filtros)}`
}

/** Recorre a la fecha 'desde' hasta la 'hasta' si quedaron cruzadas, priorizando lo que acaba de cambiar. */
function corregirRangoFechas(filtros: FiltrosHistorial, cambios: Partial<FiltrosHistorial>) {
  const { fechaDesde, fechaHasta } = filtros
  if (fechaDesde === null || fechaHasta === null || fechaDesde <= fechaHasta) return filtros
  return 'fechaDesde' in cambios
    ? { ...filtros, fechaHasta: fechaDesde }
    : { ...filtros, fechaDesde: fechaHasta }
}

export function useHistorialVentasEjemplo() {
  // --- ESTADOS: DATOS ---
  const [ahoraInicial] = useState(() => Date.now())
  const [baseVentas, setBaseVentas] = useState<BaseVentas>(() => ({
    version: 0,
    ventas: crearVentasEjemplo(ahoraInicial),
  }))

  // --- ESTADOS: CONSULTA ---
  // "filtros" es lo que tipea el usuario; "filtrosConsulta" es lo que se consulta (con debounce en el texto)
  const [filtros, setFiltros] = useState<FiltrosHistorial>(FILTROS_HISTORIAL_VACIOS)
  const [filtrosConsulta, setFiltrosConsulta] = useState<FiltrosHistorial>(FILTROS_HISTORIAL_VACIOS)
  const [pagina, setPagina] = useState(1)
  const [numeroReintento, setNumeroReintento] = useState(0)
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null)
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState('')
  const [parametrosBusqueda, setParametrosBusqueda] = useSearchParams()
  const navegar = useNavigate()

  // --- ESTADOS: DETALLE, CONFIRMACION Y COBRO ---
  const [solicitudDetalle, setSolicitudDetalle] = useState<SolicitudDetalle | null>(null)
  const [claveDetalleCargado, setClaveDetalleCargado] = useState<string | null>(null)
  const [confirmacion, setConfirmacion] = useState<ConfirmacionAccionVenta | null>(null)
  const [aviso, setAviso] = useState<AvisoHistorial | null>(null)
  const [filaACobrar, setFilaACobrar] = useState<FilaHistorial | null>(null)

  // --- RELOJ DEL PLAZO ---
  const ahoraServidor = usePlazoModificacionVenta(
    baseVentas.ventas.map((venta) => venta.fechaHoraLimiteModificacion),
    DESFASE_RELOJ_SERVIDOR_EJEMPLO_MILISEGUNDOS,
  )

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

  // Simula el GET /api/ventas con su latencia
  useEffect(() => {
    const clave = crearClaveConsulta(baseVentas.version, numeroReintento, pagina, filtrosConsulta)
    const temporizador = setTimeout(() => {
      const consulta = consultarVentasEjemplo(
        baseVentas.ventas,
        filtrosConsulta,
        pagina,
        CANTIDAD_POR_PAGINA_EJEMPLO,
      )
      // Pagina fuera de rango (por ejemplo tras anular la unica venta de la ultima): salta a la ultima
      if (consulta.ventas.length === 0 && consulta.paginacion.totalPaginas > 0) {
        setPagina(consulta.paginacion.totalPaginas)
        return
      }
      setResultado({ clave, ...consulta })
    }, LATENCIA_EJEMPLO_MILISEGUNDOS)
    return () => clearTimeout(temporizador)
  }, [baseVentas, filtrosConsulta, pagina, numeroReintento])

  // Simula el GET /api/ventas/:idVenta con su latencia
  useEffect(() => {
    if (solicitudDetalle === null) return
    const clave = `${solicitudDetalle.idVenta}|${solicitudDetalle.numero}`
    const temporizador = setTimeout(() => setClaveDetalleCargado(clave), LATENCIA_DETALLE_MILISEGUNDOS)
    return () => clearTimeout(temporizador)
  }, [solicitudDetalle])

  // --- CALCULOS: LISTA ---
  const claveConsultaActual = crearClaveConsulta(
    baseVentas.version,
    numeroReintento,
    pagina,
    filtrosConsulta,
  )
  const consultaVigente = resultado !== null && resultado.clave === claveConsultaActual
  const vistaForzada = parametrosBusqueda.get('vista')

  const estadoLista: EstadoListaHistorial = (() => {
    if (vistaForzada === 'cargando') return { tipo: 'cargando' }
    if (vistaForzada === 'error') {
      return { tipo: 'error', mensaje: 'No pudimos cargar el historial. Revisá tu conexión e intentá de nuevo.' }
    }
    if (vistaForzada === 'sin-ventas') return { tipo: 'sin-ventas' }
    if (resultado === null || !consultaVigente) return { tipo: 'cargando' }
    if (resultado.ventas.length === 0) {
      return contarFiltrosActivos(filtrosConsulta) > 0
        ? { tipo: 'sin-resultados' }
        : { tipo: 'sin-ventas' }
    }
    return {
      tipo: 'con-ventas',
      filas: resultado.ventas.map((venta) => crearFilaHistorial(venta, ahoraServidor)),
      paginacion: resultado.paginacion,
    }
  })()

  // --- CALCULOS: FILTROS ---
  const textoProductoNormalizado = textoBusquedaProducto.trim().toLowerCase()
  const productosCoincidentes: ProductoFiltro[] =
    textoProductoNormalizado === ''
      ? []
      : PRODUCTOS_EJEMPLO.filter((producto) =>
          producto.nombreProducto.toLowerCase().includes(textoProductoNormalizado),
        ).map(({ idProducto, nombreProducto }) => ({ idProducto, nombreProducto }))

  // --- CALCULOS: DETALLE ---
  const estadoDetalle: EstadoDetalleVenta | null = (() => {
    if (solicitudDetalle === null) return null
    const { idVenta, numero } = solicitudDetalle
    if (claveDetalleCargado !== `${idVenta}|${numero}`) return { tipo: 'cargando', idVenta }
    const venta = baseVentas.ventas.find((candidata) => candidata.idVenta === idVenta)
    if (!venta) {
      return { tipo: 'error', idVenta, mensaje: 'La venta ya no existe. Actualizá el listado.' }
    }
    return {
      tipo: 'listo',
      venta,
      fila: crearFilaHistorial(obtenerVentaHistorial(venta), ahoraServidor),
    }
  })()

  // --- AUXILIARES DEL "SERVIDOR" ---
  const buscarFila = (idVenta: number) => {
    const venta = baseVentas.ventas.find((candidata) => candidata.idVenta === idVenta)
    return venta ? crearFilaHistorial(obtenerVentaHistorial(venta), ahoraServidor) : undefined
  }

  /** Cambia una venta de la base y fuerza una nueva consulta, como lo haria un refetch tras la accion. */
  const actualizarVenta = (idVenta: number, transformar: (venta: VentaDetalle) => VentaDetalle) =>
    setBaseVentas((actual) => ({
      version: actual.version + 1,
      ventas: actual.ventas.map((venta) => (venta.idVenta === idVenta ? transformar(venta) : venta)),
    }))

  const quitarVenta = (idVenta: number) =>
    setBaseVentas((actual) => ({
      version: actual.version + 1,
      ventas: actual.ventas.filter((venta) => venta.idVenta !== idVenta),
    }))

  // --- ACCIONES: FILTROS Y PAGINACION ---
  const cambiarFiltros = (cambios: Partial<FiltrosHistorial>) => {
    const siguientes = { ...filtros, ...cambios }
    // Un fiado no tiene pagos: sin medio de pago. Y la busqueda por cliente solo existe para los fiados
    const normalizados =
      siguientes.estado === 'PENDIENTE_PAGO'
        ? { ...siguientes, medioPago: null }
        : { ...siguientes, textoCliente: '' }
    setFiltros(corregirRangoFechas(normalizados, cambios))
  }

  const seleccionarPeriodoRapido = (periodo: PeriodoRapido) =>
    cambiarFiltros(calcularPeriodoRapido(periodo, new Date()))

  const seleccionarProducto = (producto: ProductoFiltro | null) => {
    cambiarFiltros({ productoSeleccionado: producto })
    setTextoBusquedaProducto('')
  }

  const limpiarFiltros = () => {
    setFiltros(FILTROS_HISTORIAL_VACIOS)
    setTextoBusquedaProducto('')
  }

  const reintentarLista = () => {
    if (vistaForzada === null) return setNumeroReintento(numeroReintento + 1)
    const siguientes = new URLSearchParams(parametrosBusqueda)
    siguientes.delete('vista')
    setParametrosBusqueda(siguientes)
  }

  // --- ACCIONES: DETALLE ---
  const verDetalle = (idVenta: number) =>
    setSolicitudDetalle({ idVenta, numero: (solicitudDetalle?.numero ?? 0) + 1 })

  // --- ACCIONES: EDITAR Y ANULAR ---
  const solicitarAccion = (accion: AccionVenta, idVenta: number) => {
    const fila = buscarFila(idVenta)
    if (fila) setConfirmacion({ accion, fila, enviando: false, error: null })
  }

  const confirmarModificacion = (idVenta: number) => {
    if (confirmacion === null) return
    const confirmacionEnCurso = confirmacion
    setConfirmacion({ ...confirmacionEnCurso, enviando: true, error: null })

    setTimeout(() => {
      const ahoraRespuesta = Date.now() + DESFASE_RELOJ_SERVIDOR_EJEMPLO_MILISEGUNDOS
      const venta = baseVentas.ventas.find((candidata) => candidata.idVenta === idVenta)
      const error = simularModificacion(venta, ahoraRespuesta)

      if (error) {
        setConfirmacion({ ...confirmacionEnCurso, enviando: false, error })
        // El servidor manda: se refleja su verdad en la lista aunque el contador dijera otra cosa
        if (error.estadoHttp === 404) quitarVenta(idVenta)
        else {
          actualizarVenta(idVenta, (actual) => ({
            ...actual,
            fechaHoraLimiteModificacion:
              actual.estado === 'ANULADA'
                ? null
                : new Date(ahoraRespuesta - 1000).toISOString(),
          }))
        }
        return
      }

      // Baja logica: la venta sigue en el historial como ANULADA
      const habiaCobrado = (venta?.pagos.length ?? 0) > 0
      actualizarVenta(idVenta, (actual) => ({
        ...actual,
        estado: 'ANULADA',
        fechaHoraLimiteModificacion: null,
      }))
      setConfirmacion(null)

      if (confirmacionEnCurso.accion === 'EDITAR') {
        // Repoblar Registrar Venta con los datos de la venta queda fuera de esta maqueta
        navegar(RUTAS_REGISTRAR_VENTA.carrito)
        return
      }
      setAviso({
        mensaje: `Venta ${confirmacionEnCurso.fila.numeroComprobante} anulada. Se repuso el stock${
          habiaCobrado ? ' y se revirtió la caja' : ''
        }.`,
      })
    }, LATENCIA_ACCION_MILISEGUNDOS)
  }

  // --- ACCIONES: COBRAR FIADO ---
  const cobrarFiado = (idVenta: number) => {
    const fila = buscarFila(idVenta)
    if (!fila) return
    // Se cierra el detalle para no apilar dos paneles
    setSolicitudDetalle(null)
    setFilaACobrar(fila)
  }

  const liquidarFiado: LiquidarFiadoServidor = (idVenta, pagos) =>
    new Promise((resolver) => {
      setTimeout(() => {
        const ahoraRespuesta = Date.now() + DESFASE_RELOJ_SERVIDOR_EJEMPLO_MILISEGUNDOS
        const venta = baseVentas.ventas.find((candidata) => candidata.idVenta === idVenta)
        const error = simularCobroFiado(venta)

        if (error) {
          if (error.estadoHttp === 404) quitarVenta(idVenta)
          // "Ya cobrada por otro usuario": el listado refleja ese cobro
          if (idVenta === ID_FIADO_YA_COBRADO && venta) {
            actualizarVenta(idVenta, (actual) =>
              construirVentaCobrada(
                actual,
                [{ idMedioPago: 2, monto: actual.montoTotal }],
                ahoraRespuesta,
              ),
            )
          }
          resolver({ tipo: 'error', error })
          return
        }

        // Si no hubo error, la venta existe
        const ventaCobrada = construirVentaCobrada(venta as VentaDetalle, pagos, ahoraRespuesta)
        actualizarVenta(idVenta, () => ventaCobrada)
        resolver({ tipo: 'exito', venta: ventaCobrada })
      }, LATENCIA_COBRO_MILISEGUNDOS)
    })

  const propiedadesHistorial: HistorialVentasProps = {
    estadoLista,
    propiedadesFiltros: {
      filtros,
      opciones: {
        mediosPago: MEDIOS_EJEMPLO.map(({ idMedioPago, nombre }) => ({ idMedioPago, nombre })),
        textoBusquedaProducto,
        productosCoincidentes,
      },
      cantidadFiltrosActivos: contarFiltrosActivos(filtros),
      cantidadFiltrosAdicionales: contarFiltrosAdicionales(filtros),
      periodoRapidoActivo: detectarPeriodoRapido(
        filtros.fechaDesde,
        filtros.fechaHasta,
        new Date(ahoraServidor),
      ),
      totalResultados: consultaVigente ? resultado.paginacion.totalRegistros : null,
      onCambiarFiltros: cambiarFiltros,
      onSeleccionarPeriodoRapido: seleccionarPeriodoRapido,
      onBuscarProducto: setTextoBusquedaProducto,
      onSeleccionarProducto: seleccionarProducto,
      onLimpiarFiltros: limpiarFiltros,
    },
    acciones: {
      onVerDetalle: verDetalle,
      onSolicitarAccion: solicitarAccion,
      onCobrarFiado: cobrarFiado,
    },
    aviso,
    detalle: estadoDetalle,
    confirmacion,
    onCambiarPagina: setPagina,
    onReintentar: reintentarLista,
    onCerrarAviso: () => setAviso(null),
    onCerrarDetalle: () => setSolicitudDetalle(null),
    onReintentarDetalle: () => {
      if (solicitudDetalle) verDetalle(solicitudDetalle.idVenta)
    },
    onEditarVenta: confirmarModificacion,
    onAnularVenta: confirmarModificacion,
    onCancelarConfirmacion: () => setConfirmacion(null),
  }

  return {
    propiedadesHistorial,
    filaACobrar,
    liquidarFiado,
    cerrarCobro: () => setFilaACobrar(null),
    // Cierra el cobro y abre el detalle de esa venta, que ya es el recibo
    verRecibo: () => {
      if (filaACobrar) verDetalle(filaACobrar.idVenta)
      setFilaACobrar(null)
    },
    actualizarListado: () => {
      setFilaACobrar(null)
      setNumeroReintento(numeroReintento + 1)
    },
  }
}
