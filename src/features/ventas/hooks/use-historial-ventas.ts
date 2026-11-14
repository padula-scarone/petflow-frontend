import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { convertirDetalleApiAVentaDetalle } from '@/features/ventas/api/convertir-detalle-api-a-venta-detalle'
import { MENSAJE_DETALLE_ILEGIBLE } from '@/features/ventas/config/mensajes-error-venta'
import { useCatalogoProductos } from '@/features/ventas/hooks/use-catalogo-productos'
import { useDetalleVenta } from '@/features/ventas/hooks/use-detalle-venta'
import { useListaHistorial } from '@/features/ventas/hooks/use-lista-historial'
import { useMediosPago } from '@/features/ventas/hooks/use-medios-pago'
import { useModificarVenta } from '@/features/ventas/hooks/use-modificar-venta'
import { usePlazoModificacionVenta } from '@/features/ventas/hooks/use-plazo-modificacion-venta'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type {
  EstadoDetalleVenta,
  EstadoListaHistorial,
  FilaHistorial,
  HistorialVentasProps,
  ProductoFiltro,
} from '@/features/ventas/types/historial'
import type { ProductoCatalogo } from '@/features/ventas/types/venta'
import { crearFilaHistorial } from '@/features/ventas/utils/calcular-plazo-modificacion'
import { contarFiltrosActivos, contarFiltrosAdicionales } from '@/features/ventas/utils/contar-filtros-activos'
import { detectarPeriodoRapido } from '@/features/ventas/utils/detectar-periodo-rapido'
import { filtrarProductosCatalogo } from '@/features/ventas/utils/filtrar-productos-catalogo'
import { traducirErrorConsulta } from '@/features/ventas/utils/traducir-error-venta'

// Listas vacias estables: un recurso todavia sin cargar no cambia de identidad en cada render
const SIN_MEDIOS: MedioPago[] = []
const SIN_PRODUCTOS: ProductoCatalogo[] = []

const PARAMETRO_VENTA = 'venta'
const ID_VENTA_MAXIMO = 2_147_483_647

/** Lee `?venta=<id>`: un entero positivo que cabe en el id del back; cualquier otra cosa se ignora. */
function leerIdVentaDeParametro(texto: string | null) {
  if (texto === null || !/^\d+$/.test(texto)) return null
  const idVenta = Number(texto)
  return idVenta >= 1 && idVenta <= ID_VENTA_MAXIMO ? idVenta : null
}

/**
 * Orquesta el Historial de ventas contra el back: lista paginada con filtros, detalle, editar, anular y el cobro
 * de un fiado. Cada parte vive en su propio hook; aca solo se conectan y se arma lo que consume la vista.
 * Si la URL trae `?venta=<id>` (viene de Editar en el Comprobante), abre el detalle de esa venta y limpia el parametro.
 */
export function useHistorialVentas() {
  // --- DATOS DEL BACK COMPARTIDOS ---
  const mediosPago = useMediosPago()
  const medios = mediosPago.datos ?? SIN_MEDIOS
  const catalogo = useCatalogoProductos()

  // --- LISTA Y DETALLE ---
  const lista = useListaHistorial()
  const [parametrosBusqueda, setParametrosBusqueda] = useSearchParams()
  const [idVentaInicial] = useState(() => leerIdVentaDeParametro(parametrosBusqueda.get(PARAMETRO_VENTA)))
  const detalle = useDetalleVenta(idVentaInicial)
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState('')
  const [filaACobrar, setFilaACobrar] = useState<FilaHistorial | null>(null)

  // El parametro ya se uso al montar: se limpia para que un reload o un "atras" no vuelva a abrir el detalle
  useEffect(() => {
    if (!parametrosBusqueda.has(PARAMETRO_VENTA)) return
    const siguientes = new URLSearchParams(parametrosBusqueda)
    siguientes.delete(PARAMETRO_VENTA)
    setParametrosBusqueda(siguientes, { replace: true })
  }, [parametrosBusqueda, setParametrosBusqueda])

  // --- RELOJ DEL PLAZO ---
  // El desfase sale de la ultima respuesta: el reloj del servidor manda sobre el del dispositivo
  const detalleConsultado = detalle.estadoConsulta?.fase === 'listo' ? detalle.estadoConsulta.detalle : null
  const consultaLista = lista.consulta
  const desfaseServidorMilisegundos =
    detalleConsultado?.desfaseServidorMilisegundos ??
    (consultaLista.fase === 'lista' ? consultaLista.desfaseServidorMilisegundos : 0)
  const ahoraServidor = usePlazoModificacionVenta(
    [
      ...(consultaLista.fase === 'lista'
        ? consultaLista.ventas.map((venta) => venta.fechaHoraLimiteModificacion)
        : []),
      detalleConsultado?.venta.fechaHoraLimiteModificacion ?? null,
    ],
    desfaseServidorMilisegundos,
  )

  // --- CALCULOS: LISTA ---
  const calcularEstadoLista = (): EstadoListaHistorial => {
    if (consultaLista.fase === 'cargando') return { tipo: 'cargando' }
    if (consultaLista.fase === 'error') return { tipo: 'error', mensaje: consultaLista.mensaje }
    if (consultaLista.ventas.length === 0) {
      return { tipo: lista.hayFiltrosActivosEnConsulta ? 'sin-resultados' : 'sin-ventas' }
    }
    return {
      tipo: 'con-ventas',
      filas: consultaLista.ventas.map((venta) => crearFilaHistorial(venta, ahoraServidor)),
      paginacion: consultaLista.paginacion,
    }
  }
  const estadoLista = calcularEstadoLista()

  // --- CALCULOS: DETALLE ---
  const calcularEstadoDetalle = (): EstadoDetalleVenta | null => {
    const { idVentaAbierta, estadoConsulta } = detalle
    if (idVentaAbierta === null || estadoConsulta === null) return null
    if (estadoConsulta.fase === 'cargando') return { tipo: 'cargando', idVenta: idVentaAbierta }
    if (estadoConsulta.fase === 'error') {
      return {
        tipo: 'error',
        idVenta: idVentaAbierta,
        mensaje: traducirErrorConsulta(estadoConsulta.error, 'la venta', 'ver la venta'),
      }
    }
    const venta = convertirDetalleApiAVentaDetalle(estadoConsulta.detalle.venta, medios)
    if (venta === null) return { tipo: 'error', idVenta: idVentaAbierta, mensaje: MENSAJE_DETALLE_ILEGIBLE }
    // La fila sale del propio detalle: la venta puede no estar en la pagina que se esta viendo
    return { tipo: 'listo', venta, fila: crearFilaHistorial(venta, ahoraServidor) }
  }
  const estadoDetalle = calcularEstadoDetalle()

  /** Busca la fila en el detalle abierto y, si no esta, en la lista. */
  const buscarFila = (idVenta: number): FilaHistorial | undefined => {
    if (estadoDetalle?.tipo === 'listo' && estadoDetalle.venta.idVenta === idVenta) return estadoDetalle.fila
    return estadoLista.tipo === 'con-ventas'
      ? estadoLista.filas.find((fila) => fila.idVenta === idVenta)
      : undefined
  }

  // --- CALCULOS: FILTROS ---
  const productosCoincidentes = filtrarProductosCatalogo(catalogo.datos ?? SIN_PRODUCTOS, textoBusquedaProducto)

  // --- EDITAR Y ANULAR ---
  const modificacion = useModificarVenta({
    buscarFila,
    medios,
    desfaseServidorMilisegundos,
    // La verdad la tiene el servidor: se vuelve a pedir la pagina actual y, si hay uno abierto, el detalle
    alCambiarVenta: () => {
      lista.refrescar()
      if (detalle.idVentaAbierta !== null) detalle.recargar()
    },
  })

  // --- ACCIONES ---
  const seleccionarProducto = (producto: ProductoFiltro | null) => {
    lista.cambiarFiltros({ productoSeleccionado: producto })
    setTextoBusquedaProducto('')
  }

  const limpiarFiltros = () => {
    lista.limpiarFiltros()
    setTextoBusquedaProducto('')
  }

  const cobrarFiado = (idVenta: number) => {
    const fila = buscarFila(idVenta)
    if (!fila) return
    // Se cierra el detalle para no apilar dos paneles
    detalle.cerrar()
    setFilaACobrar(fila)
  }

  const propiedadesHistorial: HistorialVentasProps = {
    estadoLista,
    propiedadesFiltros: {
      filtros: lista.filtros,
      opciones: {
        mediosPago: medios.map(({ idMedioPago, nombre }) => ({ idMedioPago, nombre })),
        textoBusquedaProducto,
        productosCoincidentes,
      },
      cantidadFiltrosActivos: contarFiltrosActivos(lista.filtros),
      cantidadFiltrosAdicionales: contarFiltrosAdicionales(lista.filtros),
      periodoRapidoActivo: detectarPeriodoRapido(
        lista.filtros.fechaDesde,
        lista.filtros.fechaHasta,
        new Date(ahoraServidor),
      ),
      totalResultados: consultaLista.fase === 'lista' ? consultaLista.paginacion.totalRegistros : null,
      onCambiarFiltros: lista.cambiarFiltros,
      onSeleccionarPeriodoRapido: lista.seleccionarPeriodoRapido,
      onBuscarProducto: setTextoBusquedaProducto,
      onSeleccionarProducto: seleccionarProducto,
      onLimpiarFiltros: limpiarFiltros,
    },
    acciones: {
      onVerDetalle: detalle.abrir,
      onSolicitarAccion: modificacion.solicitarAccion,
      onCobrarFiado: cobrarFiado,
    },
    aviso: modificacion.aviso,
    detalle: estadoDetalle,
    confirmacion: modificacion.confirmacion,
    onCambiarPagina: lista.cambiarPagina,
    onReintentar: lista.reintentar,
    onCerrarAviso: modificacion.cerrarAviso,
    onCerrarDetalle: detalle.cerrar,
    onReintentarDetalle: detalle.recargar,
    onEditarVenta: () => void modificacion.confirmarAccion(),
    onAnularVenta: () => void modificacion.confirmarAccion(),
    onCancelarConfirmacion: modificacion.cancelarConfirmacion,
    onSeleccionarMotivo: modificacion.seleccionarMotivo,
    onCambiarDetalleMotivo: modificacion.cambiarDetalleMotivo,
  }

  return {
    propiedadesHistorial,
    /** null mientras no hay un cobro abierto. */
    cobro:
      filaACobrar === null
        ? null
        : {
            fila: filaACobrar,
            medios,
            estadoMediosPago: mediosPago.estado,
            onReintentarMediosPago: mediosPago.recargar,
            onCerrar: () => setFilaACobrar(null),
            // Cierra el cobro y abre el detalle de esa venta, que ya es el recibo
            onVerRecibo: () => {
              detalle.abrir(filaACobrar.idVenta)
              setFilaACobrar(null)
            },
            onActualizarListado: () => {
              setFilaACobrar(null)
              lista.refrescar()
            },
            alCambiarVenta: lista.refrescar,
          },
  }
}
