import { useState } from 'react'
import { MENSAJE_CAMBIO_INEXISTENTE } from '@/features/ventas/cambios-mercaderia/config/mensajes-error-cambio'
import { useDetalleCambio } from '@/features/ventas/cambios-mercaderia/hooks/use-detalle-cambio'
import { useListaCambios } from '@/features/ventas/cambios-mercaderia/hooks/use-lista-cambios'
import { useModificarCambio } from '@/features/ventas/cambios-mercaderia/hooks/use-modificar-cambio'
import type {
  AltaRepoblada,
  CambioMercaderiaDetalle,
  CambiosPosventaProps,
  EstadoDetalleCambio,
  EstadoListaCambios,
  FilaCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import { convertirCambioAListado, crearFilaCambio } from '@/features/ventas/cambios-mercaderia/utils/calcular-ventana-cambio'
import { contarFiltrosActivosCambios, contarFiltrosAdicionalesCambios } from '@/features/ventas/cambios-mercaderia/utils/contar-filtros-cambios'
import { useCatalogoProductos } from '@/features/ventas/hooks/use-catalogo-productos'
import { useMediosPago } from '@/features/ventas/hooks/use-medios-pago'
import { usePlazoModificacionVenta } from '@/features/ventas/hooks/use-plazo-modificacion-venta'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type { ProductoFiltro } from '@/features/ventas/types/historial'
import type { ProductoCatalogo } from '@/features/ventas/types/venta'
import { detectarPeriodoRapido } from '@/features/ventas/utils/detectar-periodo-rapido'
import { filtrarProductosCatalogo } from '@/features/ventas/utils/filtrar-productos-catalogo'
import { traducirErrorConsulta } from '@/features/ventas/utils/traducir-error-venta'

// Listas vacias estables: un recurso todavia sin cargar no cambia de identidad en cada render
const SIN_MEDIOS: MedioPago[] = []
const SIN_PRODUCTOS: ProductoCatalogo[] = []

/** Alta abierta: la clave fuerza a montarla de cero cada vez, y `altaRepoblada` trae los datos de una edicion. */
interface EstadoAlta {
  clave: number
  altaRepoblada: AltaRepoblada | null
}

/**
 * Orquesta Cambios posventa contra el back: lista paginada con filtros, detalle, anular, editar y la apertura
 * del alta. Cada parte vive en su propio hook; aca solo se conectan y se arma lo que consume la vista. El alta
 * tiene su propio hook, que se monta solo mientras el modal esta abierto.
 */
export function useCambiosPosventa() {
  // --- DATOS DEL BACK COMPARTIDOS ---
  const mediosPago = useMediosPago()
  const medios = mediosPago.datos ?? SIN_MEDIOS
  const catalogo = useCatalogoProductos()

  // --- LISTA Y DETALLE ---
  const lista = useListaCambios()
  const detalle = useDetalleCambio()
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState('')
  const [alta, setAlta] = useState<EstadoAlta | null>(null)

  // --- RELOJ DEL PLAZO ---
  // El desfase sale de la ultima respuesta: el reloj del servidor manda sobre el del dispositivo
  const detalleConsultado = detalle.estadoConsulta?.fase === 'listo' ? detalle.estadoConsulta.consultado : null
  const consultaLista = lista.consulta
  const desfaseServidorMilisegundos =
    detalleConsultado?.desfaseServidorMilisegundos ??
    (consultaLista.fase === 'lista' ? consultaLista.desfaseServidorMilisegundos : 0)
  const ahoraServidor = usePlazoModificacionVenta(
    [
      ...(consultaLista.fase === 'lista'
        ? consultaLista.cambios.map((cambio) => cambio.fechaHoraLimiteModificacion)
        : []),
      detalleConsultado?.cambio.fechaHoraLimiteModificacion ?? null,
    ],
    desfaseServidorMilisegundos,
  )

  // --- CALCULOS: LISTA ---
  const calcularEstadoLista = (): EstadoListaCambios => {
    if (consultaLista.fase === 'cargando') return { tipo: 'cargando' }
    if (consultaLista.fase === 'error') return { tipo: 'error', mensaje: consultaLista.mensaje }
    if (consultaLista.cambios.length === 0) {
      return { tipo: lista.hayFiltrosActivosEnConsulta ? 'sin-resultados' : 'sin-cambios' }
    }
    return {
      tipo: 'con-cambios',
      filas: consultaLista.cambios.map((cambio) => crearFilaCambio(cambio, ahoraServidor)),
      paginacion: consultaLista.paginacion,
    }
  }
  const estadoLista = calcularEstadoLista()

  // --- CALCULOS: DETALLE ---
  const calcularEstadoDetalle = (): EstadoDetalleCambio | null => {
    const { idCambioAbierto, estadoConsulta } = detalle
    if (idCambioAbierto === null || estadoConsulta === null) return null
    if (estadoConsulta.fase === 'cargando') return { tipo: 'cargando', idCambio: idCambioAbierto }
    if (estadoConsulta.fase === 'error') {
      return {
        tipo: 'error',
        idCambio: idCambioAbierto,
        mensaje:
          estadoConsulta.error.estado === 404
            ? MENSAJE_CAMBIO_INEXISTENTE
            : traducirErrorConsulta(estadoConsulta.error, 'el cambio', 'ver el cambio'),
      }
    }
    const { cambio } = estadoConsulta.consultado
    // La fila sale del propio detalle: el cambio puede no estar en la pagina que se esta viendo
    return { tipo: 'listo', cambio, fila: crearFilaCambio(convertirCambioAListado(cambio), ahoraServidor) }
  }
  const estadoDetalle = calcularEstadoDetalle()

  /** Busca la fila en el detalle abierto y, si no esta, en la lista. */
  const buscarFila = (idCambio: number): FilaCambio | undefined => {
    if (estadoDetalle?.tipo === 'listo' && estadoDetalle.cambio.idCambio === idCambio) return estadoDetalle.fila
    return estadoLista.tipo === 'con-cambios'
      ? estadoLista.filas.find((fila) => fila.idCambio === idCambio)
      : undefined
  }

  // --- CALCULOS: FILTROS ---
  // El catalogo se pide una vez y se filtra en el dispositivo: no hay un pedido por tecla (RNF-GENERAL-02)
  const productosCoincidentes = filtrarProductosCatalogo(catalogo.datos ?? SIN_PRODUCTOS, textoBusquedaProducto)

  // --- ALTA ---
  const abrirAlta = (altaRepoblada: AltaRepoblada | null) =>
    setAlta((actual) => ({ clave: (actual?.clave ?? 0) + 1, altaRepoblada }))

  // --- EDITAR Y ANULAR ---
  const modificacion = useModificarCambio({
    buscarFila,
    medios,
    desfaseServidorMilisegundos,
    // La verdad la tiene el servidor: se vuelve a pedir la pagina actual y, si hay uno abierto, el detalle
    alCambiarCambio: () => {
      lista.refrescar()
      if (detalle.idCambioAbierto !== null) detalle.recargar()
    },
    alReabrirAlta: (altaRepoblada) => abrirAlta(altaRepoblada),
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

  // Se cierra el detalle para no apilar dos paneles
  const solicitarAccion = (accion: 'EDITAR' | 'ANULAR', idCambio: number) => {
    modificacion.solicitarAccion(accion, idCambio)
    detalle.cerrar()
  }

  /** El alta guardo el cambio: se vuelve a pedir la pagina actual y se avisa. */
  const registrarCambio = (cambio: CambioMercaderiaDetalle) => {
    lista.refrescar()
    modificacion.mostrarAviso({ mensaje: `Cambio ${cambio.idCambio} registrado.` })
  }

  const propiedadesCambios: CambiosPosventaProps = {
    estadoLista,
    propiedadesFiltros: {
      filtros: lista.filtros,
      opciones: {
        mediosPago: medios.map(({ idMedioPago, nombre }) => ({ idMedioPago, nombre })),
        textoBusquedaProducto,
        productosCoincidentes,
      },
      cantidadFiltrosActivos: contarFiltrosActivosCambios(lista.filtros),
      cantidadFiltrosAdicionales: contarFiltrosAdicionalesCambios(lista.filtros),
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
      onVerDetalleCambio: detalle.abrir,
      onEditarCambio: (idCambio) => solicitarAccion('EDITAR', idCambio),
      onAnularCambio: (idCambio) => solicitarAccion('ANULAR', idCambio),
    },
    aviso: modificacion.aviso,
    detalle: estadoDetalle,
    confirmacion: modificacion.confirmacion,
    onCargarNuevoCambio: () => abrirAlta(null),
    onCambiarPagina: lista.cambiarPagina,
    onReintentar: lista.reintentar,
    onCerrarAviso: modificacion.cerrarAviso,
    onCerrarDetalle: detalle.cerrar,
    onReintentarDetalle: detalle.recargar,
    onConfirmarAccionCambio: () => void modificacion.confirmarAccion(),
    onCancelarConfirmacion: modificacion.cancelarConfirmacion,
    onSeleccionarMotivo: modificacion.seleccionarMotivo,
    onCambiarDetalleMotivo: modificacion.cambiarDetalleMotivo,
  }

  return {
    propiedadesCambios,
    alta,
    desfaseServidorMilisegundos,
    cerrarAlta: () => setAlta(null),
    registrarCambio,
    refrescarLista: lista.refrescar,
    verDetalle: detalle.abrir,
  }
}
