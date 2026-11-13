import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
  DESFASE_RELOJ_SERVIDOR_CAMBIOS_MILISEGUNDOS,
  LATENCIA_ACCION_CAMBIO_MILISEGUNDOS,
  LATENCIA_DETALLE_CAMBIO_MILISEGUNDOS,
  NOMBRE_USUARIO_CAMBIOS_EJEMPLO,
} from '@/features/ventas/cambios-mercaderia/config/simulacion-cambios'
import type {
  AccionCambio,
  AvisoCambios,
  BorradorCambio,
  CambioMercaderiaDetalle,
  CambiosPosventaProps,
  CodigoMotivoAccionCambio,
  ConfirmacionAccionCambio,
  EstadoDetalleCambio,
  EstadoListaCambios,
  FiltrosCambios,
  CambioMercaderiaListado,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import { buscarProductosCambioEjemplo } from '@/features/ventas/cambios-mercaderia/utils/catalogo-cambios-ejemplo'
import { crearFilaCambio } from '@/features/ventas/cambios-mercaderia/utils/calcular-ventana-cambio'
import {
  contarFiltrosActivosCambios,
  contarFiltrosAdicionalesCambios,
  FILTROS_CAMBIOS_VACIOS,
} from '@/features/ventas/cambios-mercaderia/utils/contar-filtros-cambios'
import { convertirCambioABorrador } from '@/features/ventas/cambios-mercaderia/utils/convertir-cambio-a-borrador'
import {
  consultarCambiosEjemplo,
  obtenerCambioListado,
} from '@/features/ventas/cambios-mercaderia/utils/consultar-cambios-ejemplo'
import { crearCambiosEjemplo } from '@/features/ventas/cambios-mercaderia/utils/crear-cambios-ejemplo'
import { simularModificacionCambio } from '@/features/ventas/cambios-mercaderia/utils/simular-servidor-cambios-ejemplo'
import { CANTIDAD_POR_PAGINA_EJEMPLO, LATENCIA_EJEMPLO_MILISEGUNDOS } from '@/features/ventas/config/plazo-modificacion'
import { CODIGO_MOTIVO_OTRO } from '@/features/ventas/config/motivos-venta'
import { MEDIOS_EJEMPLO } from '@/features/ventas/hooks/use-cobro-venta-ejemplo'
import { usePlazoModificacionVenta } from '@/features/ventas/hooks/use-plazo-modificacion-venta'
import type { PaginacionResultados } from '@/features/ventas/types/compartidos'
import type { PeriodoRapido, ProductoFiltro, VentaDetalle } from '@/features/ventas/types/historial'
import { calcularPeriodoRapido } from '@/features/ventas/utils/calcular-periodo-rapido'
import { corregirRangoFechas } from '@/features/ventas/utils/corregir-rango-fechas'
import { crearVentasEjemplo } from '@/features/ventas/utils/crear-ventas-ejemplo'
import { detectarPeriodoRapido } from '@/features/ventas/utils/detectar-periodo-rapido'
import { esMotivoValido } from '@/features/ventas/utils/motivos-venta'
import { formatearMoneda } from '@/lib/formatear-moneda'

// --- DATOS DE EJEMPLO ---
// Hook temporal para probar la vista: se reemplaza por el hook real de la accion Consultar Cambios.
//
// Cambios con comportamiento fijo (todas las fechas son relativas a "ahora"):
//   2012  plazo vigente, vinculado a la venta 1046, se entrego un producto a granel
//   2011  plazo vigente, pero editar y anular responden 403 (el servidor manda sobre el contador)
//   2010  le quedan 30 segundos de plazo: pierde Editar y Anular en vivo, sin recargar. Sin saldo
//   2009  desvinculado, con bolsa abierta (7,2 kg de 7,5): anular responde 409 (no hay stock a granel para revertir)
//   2008  vinculado a la venta 1047: agoto las piedras sanitarias (2 de 2), no se pueden devolver mas
//   2007  anulado, con motivo, usuario y fecha y hora de la anulacion
//   2006  vinculado a la venta 1043 (producto a granel)
//
// Errores al cargar un cambio nuevo:
//   vincular la venta 1044        409 no hay caja abierta
//   vincular la venta 1043        404 venta no encontrada
//   entregar el producto 7        409 sin stock (Rascador para gatos)
//   entregar el producto 6        400 datos rechazados (Shampoo para perros)
//
// Estados de la lista: agregar ?vista=cargando, ?vista=error o ?vista=sin-cambios a la URL.
// Estados de la busqueda de venta del alta: ?vistaBusqueda=cargando, =error o =sin-resultados.

/** Base de ejemplo con un contador que sube con cada cambio, para disparar una nueva consulta. */
interface BaseCambios {
  version: number
  cambios: CambioMercaderiaDetalle[]
}

/** Confirmacion abierta tal como se guarda: "motivoValido" se calcula al exponerla. */
type EstadoConfirmacion = Omit<ConfirmacionAccionCambio, 'motivoValido'>

interface SolicitudDetalle {
  idCambio: number
  /** Sube en cada pedido, para que reabrir el mismo detalle vuelva a cargarlo. */
  numero: number
}

interface ResultadoConsulta {
  /** Identifica a que consulta pertenece; si no coincide con la actual, se esta cargando. */
  clave: string
  cambios: CambioMercaderiaListado[]
  paginacion: PaginacionResultados
}

/** Alta abierta: la clave fuerza a montarla de cero cada vez, y el borrador repuebla una edicion. */
interface EstadoAlta {
  clave: number
  borradorInicial: BorradorCambio | null
}

function crearClaveConsulta(version: number, numeroReintento: number, pagina: number, filtros: FiltrosCambios) {
  return `${version}|${numeroReintento}|${pagina}|${JSON.stringify(filtros)}`
}

export function useCambiosPosventaEjemplo() {
  // --- ESTADOS: DATOS ---
  const [ahoraInicial] = useState(() => Date.now())
  const [ventas] = useState<VentaDetalle[]>(() => crearVentasEjemplo(ahoraInicial))
  const [baseCambios, setBaseCambios] = useState<BaseCambios>(() => ({
    version: 0,
    cambios: crearCambiosEjemplo(ahoraInicial, ventas),
  }))

  // --- ESTADOS: CONSULTA ---
  const [filtros, setFiltros] = useState<FiltrosCambios>(FILTROS_CAMBIOS_VACIOS)
  const [pagina, setPagina] = useState(1)
  const [numeroReintento, setNumeroReintento] = useState(0)
  const [resultado, setResultado] = useState<ResultadoConsulta | null>(null)
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState('')
  const [parametrosBusqueda, setParametrosBusqueda] = useSearchParams()

  // --- ESTADOS: DETALLE, CONFIRMACION, AVISO Y ALTA ---
  const [solicitudDetalle, setSolicitudDetalle] = useState<SolicitudDetalle | null>(null)
  const [claveDetalleCargado, setClaveDetalleCargado] = useState<string | null>(null)
  const [confirmacion, setConfirmacion] = useState<EstadoConfirmacion | null>(null)
  const [aviso, setAviso] = useState<AvisoCambios | null>(null)
  const [alta, setAlta] = useState<EstadoAlta | null>(null)

  // --- RELOJ DEL PLAZO ---
  const ahoraServidor = usePlazoModificacionVenta(
    baseCambios.cambios.map((cambio) => cambio.fechaHoraLimiteModificacion),
    DESFASE_RELOJ_SERVIDOR_CAMBIOS_MILISEGUNDOS,
  )

  // --- EFECTOS ---
  // Simula el GET /api/cambios-mercaderia con su latencia
  useEffect(() => {
    const clave = crearClaveConsulta(baseCambios.version, numeroReintento, pagina, filtros)
    const temporizador = setTimeout(() => {
      const consulta = consultarCambiosEjemplo(baseCambios.cambios, filtros, pagina, CANTIDAD_POR_PAGINA_EJEMPLO)
      // Pagina fuera de rango: salta a la ultima
      if (consulta.cambios.length === 0 && consulta.paginacion.totalPaginas > 0) {
        setPagina(consulta.paginacion.totalPaginas)
        return
      }
      setResultado({ clave, ...consulta })
    }, LATENCIA_EJEMPLO_MILISEGUNDOS)
    return () => clearTimeout(temporizador)
  }, [baseCambios, filtros, pagina, numeroReintento])

  // Simula el GET /api/cambios-mercaderia/:idCambio con su latencia
  useEffect(() => {
    if (solicitudDetalle === null) return
    const clave = `${solicitudDetalle.idCambio}|${solicitudDetalle.numero}`
    const temporizador = setTimeout(() => setClaveDetalleCargado(clave), LATENCIA_DETALLE_CAMBIO_MILISEGUNDOS)
    return () => clearTimeout(temporizador)
  }, [solicitudDetalle])

  // --- CALCULOS: LISTA ---
  const claveConsultaActual = crearClaveConsulta(baseCambios.version, numeroReintento, pagina, filtros)
  const consultaVigente = resultado !== null && resultado.clave === claveConsultaActual
  const vistaForzada = parametrosBusqueda.get('vista')

  const estadoLista: EstadoListaCambios = (() => {
    if (vistaForzada === 'cargando') return { tipo: 'cargando' }
    if (vistaForzada === 'error') {
      return { tipo: 'error', mensaje: 'No pudimos cargar los cambios. Revisá tu conexión e intentá de nuevo.' }
    }
    if (vistaForzada === 'sin-cambios') return { tipo: 'sin-cambios' }
    if (resultado === null || !consultaVigente) return { tipo: 'cargando' }
    if (resultado.cambios.length === 0) {
      return contarFiltrosActivosCambios(filtros) > 0 ? { tipo: 'sin-resultados' } : { tipo: 'sin-cambios' }
    }
    return {
      tipo: 'con-cambios',
      filas: resultado.cambios.map((cambio) => crearFilaCambio(cambio, ahoraServidor)),
      paginacion: resultado.paginacion,
    }
  })()

  // --- CALCULOS: FILTROS ---
  const productosCoincidentes: ProductoFiltro[] = buscarProductosCambioEjemplo(textoBusquedaProducto).map(
    ({ idProducto, nombreProducto }) => ({ idProducto, nombreProducto }),
  )

  // --- CALCULOS: DETALLE ---
  const estadoDetalle: EstadoDetalleCambio | null = (() => {
    if (solicitudDetalle === null) return null
    const { idCambio, numero } = solicitudDetalle
    if (claveDetalleCargado !== `${idCambio}|${numero}`) return { tipo: 'cargando', idCambio }
    const cambio = baseCambios.cambios.find((candidato) => candidato.idCambio === idCambio)
    if (!cambio) return { tipo: 'error', idCambio, mensaje: 'El cambio ya no existe. Actualizá el listado.' }
    return { tipo: 'listo', cambio, fila: crearFilaCambio(obtenerCambioListado(cambio), ahoraServidor) }
  })()

  // --- AUXILIARES DEL "SERVIDOR" ---
  const buscarFila = (idCambio: number) => {
    const cambio = baseCambios.cambios.find((candidato) => candidato.idCambio === idCambio)
    return cambio ? crearFilaCambio(obtenerCambioListado(cambio), ahoraServidor) : undefined
  }

  /** Reemplaza la base y fuerza una nueva consulta, como lo haria un refetch tras la accion. */
  const actualizarBase = (transformar: (cambios: CambioMercaderiaDetalle[]) => CambioMercaderiaDetalle[]) =>
    setBaseCambios((actual) => ({ version: actual.version + 1, cambios: transformar(actual.cambios) }))

  const actualizarCambio = (
    idCambio: number,
    transformar: (cambio: CambioMercaderiaDetalle) => CambioMercaderiaDetalle,
  ) => actualizarBase((cambios) => cambios.map((cambio) => (cambio.idCambio === idCambio ? transformar(cambio) : cambio)))

  const quitarCambio = (idCambio: number) =>
    actualizarBase((cambios) => cambios.filter((cambio) => cambio.idCambio !== idCambio))

  // --- ACCIONES: FILTROS Y PAGINACION ---
  const cambiarFiltros = (cambios: Partial<FiltrosCambios>) => {
    setFiltros(corregirRangoFechas({ ...filtros, ...cambios }, cambios))
    // Una busqueda nueva siempre arranca en la primera pagina
    setPagina(1)
  }

  const seleccionarProducto = (producto: ProductoFiltro | null) => {
    cambiarFiltros({ productoSeleccionado: producto })
    setTextoBusquedaProducto('')
  }

  const limpiarFiltros = () => {
    setFiltros(FILTROS_CAMBIOS_VACIOS)
    setPagina(1)
    setTextoBusquedaProducto('')
  }

  const reintentarLista = () => {
    if (vistaForzada === null) return setNumeroReintento(numeroReintento + 1)
    const siguientes = new URLSearchParams(parametrosBusqueda)
    siguientes.delete('vista')
    setParametrosBusqueda(siguientes)
  }

  // --- ACCIONES: DETALLE ---
  const verDetalle = (idCambio: number) =>
    setSolicitudDetalle({ idCambio, numero: (solicitudDetalle?.numero ?? 0) + 1 })

  // --- ACCIONES: EDITAR Y ANULAR ---
  const solicitarAccion = (accion: AccionCambio, idCambio: number) => {
    const fila = buscarFila(idCambio)
    // Sin motivo elegido: no hay opcion preseleccionada. Se cierra el detalle para no apilar dos paneles
    if (fila) {
      setSolicitudDetalle(null)
      setConfirmacion({ accion, fila, enviando: false, error: null, codigoMotivo: null, detalleMotivo: '' })
    }
  }

  const seleccionarMotivo = (codigoMotivo: string) =>
    setConfirmacion((actual) =>
      // El detalle solo existe con "Otro": al elegir otro motivo se descarta lo escrito
      actual && {
        ...actual,
        codigoMotivo,
        detalleMotivo: codigoMotivo === CODIGO_MOTIVO_OTRO ? actual.detalleMotivo : '',
      },
    )

  const cambiarDetalleMotivo = (detalleMotivo: string) =>
    setConfirmacion((actual) => actual && { ...actual, detalleMotivo })

  const confirmarAccion = () => {
    if (confirmacion === null) return
    // El front no deja confirmar sin motivo; el servidor tambien lo validaria (400)
    if (!esMotivoValido(confirmacion.codigoMotivo, confirmacion.detalleMotivo)) return
    const confirmacionEnCurso = confirmacion
    const { codigoMotivo, detalleMotivo } = confirmacionEnCurso
    const idCambio = confirmacionEnCurso.fila.idCambio
    setConfirmacion({ ...confirmacionEnCurso, enviando: true, error: null })

    setTimeout(() => {
      const ahoraRespuesta = Date.now() + DESFASE_RELOJ_SERVIDOR_CAMBIOS_MILISEGUNDOS
      const cambio = baseCambios.cambios.find((candidato) => candidato.idCambio === idCambio)
      const error = simularModificacionCambio(cambio, ahoraRespuesta)

      if (error) {
        setConfirmacion({ ...confirmacionEnCurso, enviando: false, error })
        // El servidor manda: se refleja su verdad en la lista aunque el contador dijera otra cosa
        if (error.estadoHttp === 404) quitarCambio(idCambio)
        else if (error.codigo === 'PLAZO_VENCIDO' || error.codigo === 'CAMBIO_YA_ANULADO') {
          actualizarCambio(idCambio, (actual) => ({
            ...actual,
            fechaHoraLimiteModificacion:
              actual.estado === 'ANULADO' ? null : new Date(ahoraRespuesta - 1000).toISOString(),
          }))
        }
        return
      }

      // Baja logica: el cambio sigue en la lista como ANULADO
      const cambioAnulado: CambioMercaderiaDetalle = {
        ...(cambio as CambioMercaderiaDetalle),
        estado: 'ANULADO',
        fechaHoraLimiteModificacion: null,
        // El servidor asigna usuario y fecha y hora; el motivo viene de la persona
        anulacion: {
          accion: confirmacionEnCurso.accion,
          codigoMotivo: codigoMotivo as CodigoMotivoAccionCambio,
          detalleMotivo: codigoMotivo === CODIGO_MOTIVO_OTRO ? detalleMotivo.trim() : null,
          nombreUsuario: NOMBRE_USUARIO_CAMBIOS_EJEMPLO,
          fechaHora: new Date(ahoraRespuesta).toISOString(),
        },
      }
      const cambiosActualizados = baseCambios.cambios.map((candidato) =>
        candidato.idCambio === idCambio ? cambioAnulado : candidato,
      )
      actualizarBase(() => cambiosActualizados)
      setConfirmacion(null)

      if (confirmacionEnCurso.accion === 'EDITAR') {
        // Repoblar el alta con los datos del cambio es lo que haria la integracion con la respuesta del back
        setAlta((actual) => ({
          clave: (actual?.clave ?? 0) + 1,
          borradorInicial: convertirCambioABorrador(cambioAnulado, ventas, cambiosActualizados),
        }))
        return
      }
      setAviso({
        mensaje: `Cambio ${idCambio} anulado. Se revirtió el stock${
          cambio && cambio.saldoResultante > 0
            ? ` y se restaron ${formatearMoneda(cambio.saldoResultante)} de la caja`
            : ''
        }.`,
      })
    }, LATENCIA_ACCION_CAMBIO_MILISEGUNDOS)
  }

  // --- ACCIONES: ALTA ---
  const abrirAlta = () =>
    setAlta((actual) => ({ clave: (actual?.clave ?? 0) + 1, borradorInicial: null }))

  const cerrarAlta = () => setAlta(null)

  const registrarCambio = (cambio: CambioMercaderiaDetalle) => {
    actualizarBase((cambios) => [cambio, ...cambios])
    setAviso({ mensaje: `Cambio ${cambio.idCambio} registrado.` })
  }

  const propiedadesCambios: CambiosPosventaProps = {
    estadoLista,
    propiedadesFiltros: {
      filtros,
      opciones: {
        mediosPago: MEDIOS_EJEMPLO.map(({ idMedioPago, nombre }) => ({ idMedioPago, nombre })),
        textoBusquedaProducto,
        productosCoincidentes,
      },
      cantidadFiltrosActivos: contarFiltrosActivosCambios(filtros),
      cantidadFiltrosAdicionales: contarFiltrosAdicionalesCambios(filtros),
      periodoRapidoActivo: detectarPeriodoRapido(filtros.fechaDesde, filtros.fechaHasta, new Date(ahoraServidor)),
      totalResultados: consultaVigente ? resultado.paginacion.totalRegistros : null,
      onCambiarFiltros: cambiarFiltros,
      onSeleccionarPeriodoRapido: (periodo: PeriodoRapido) =>
        cambiarFiltros(calcularPeriodoRapido(periodo, new Date())),
      onBuscarProducto: setTextoBusquedaProducto,
      onSeleccionarProducto: seleccionarProducto,
      onLimpiarFiltros: limpiarFiltros,
    },
    acciones: {
      onVerDetalleCambio: verDetalle,
      onEditarCambio: (idCambio) => solicitarAccion('EDITAR', idCambio),
      onAnularCambio: (idCambio) => solicitarAccion('ANULAR', idCambio),
    },
    aviso,
    detalle: estadoDetalle,
    confirmacion: confirmacion && {
      ...confirmacion,
      motivoValido: esMotivoValido(confirmacion.codigoMotivo, confirmacion.detalleMotivo),
    },
    onCargarNuevoCambio: abrirAlta,
    onCambiarPagina: setPagina,
    onReintentar: reintentarLista,
    onCerrarAviso: () => setAviso(null),
    onCerrarDetalle: () => setSolicitudDetalle(null),
    onReintentarDetalle: () => {
      if (solicitudDetalle) verDetalle(solicitudDetalle.idCambio)
    },
    onConfirmarAccionCambio: confirmarAccion,
    onCancelarConfirmacion: () => setConfirmacion(null),
    onSeleccionarMotivo: seleccionarMotivo,
    onCambiarDetalleMotivo: cambiarDetalleMotivo,
  }

  return {
    propiedadesCambios,
    alta,
    ventas,
    cambios: baseCambios.cambios,
    abrirAlta,
    cerrarAlta,
    registrarCambio,
    verDetalle,
  }
}
