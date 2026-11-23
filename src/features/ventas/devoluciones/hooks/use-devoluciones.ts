import { useState } from 'react'
import { MENSAJE_DEVOLUCION_INEXISTENTE } from '@/features/ventas/devoluciones/config/mensajes-error-devolucion'
import { useDetalleDevolucion } from '@/features/ventas/devoluciones/hooks/use-detalle-devolucion'
import { useListaDevoluciones } from '@/features/ventas/devoluciones/hooks/use-lista-devoluciones'
import { useModificarDevolucion } from '@/features/ventas/devoluciones/hooks/use-modificar-devolucion'
import type {
  AltaRepoblada,
  DevolucionDetalle,
  DevolucionesProps,
  EstadoDetalleDevolucion,
  EstadoListaDevoluciones,
  FilaDevolucion,
} from '@/features/ventas/devoluciones/types/devolucion'
import { convertirDevolucionAListado, crearFilaDevolucion } from '@/features/ventas/devoluciones/utils/calcular-ventana-devolucion'
import {
  contarFiltrosActivosDevoluciones,
  contarFiltrosAdicionalesDevoluciones,
  contarFiltrosEnHojaDevoluciones,
} from '@/features/ventas/devoluciones/utils/contar-filtros-devoluciones'
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
 * Orquesta Devoluciones contra el back: lista paginada con filtros, detalle, anular, editar y la apertura
 * del alta. Cada parte vive en su propio hook; aca solo se conectan y se arma lo que consume la vista. El alta
 * tiene su propio hook, que se monta solo mientras el modal esta abierto.
 */
export function useDevoluciones() {
  // --- DATOS DEL BACK COMPARTIDOS ---
  const mediosPago = useMediosPago()
  const medios = mediosPago.datos ?? SIN_MEDIOS
  const catalogo = useCatalogoProductos()

  // --- LISTA Y DETALLE ---
  const lista = useListaDevoluciones()
  const detalle = useDetalleDevolucion()
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
        ? consultaLista.devoluciones.map((devolucion) => devolucion.fechaHoraLimiteModificacion)
        : []),
      detalleConsultado?.devolucion.fechaHoraLimiteModificacion ?? null,
    ],
    desfaseServidorMilisegundos,
  )

  // --- CALCULOS: LISTA ---
  const calcularEstadoLista = (): EstadoListaDevoluciones => {
    if (consultaLista.fase === 'cargando') return { tipo: 'cargando' }
    if (consultaLista.fase === 'error') return { tipo: 'error', mensaje: consultaLista.mensaje }
    if (consultaLista.devoluciones.length === 0) {
      return { tipo: lista.hayFiltrosActivosEnConsulta ? 'sin-resultados' : 'sin-devoluciones' }
    }
    return {
      tipo: 'con-devoluciones',
      filas: consultaLista.devoluciones.map((devolucion) => crearFilaDevolucion(devolucion, ahoraServidor)),
      paginacion: consultaLista.paginacion,
    }
  }
  const estadoLista = calcularEstadoLista()

  // --- CALCULOS: DETALLE ---
  const calcularEstadoDetalle = (): EstadoDetalleDevolucion | null => {
    const { idDevolucionAbierta: idDevolucionAbierta, estadoConsulta } = detalle
    if (idDevolucionAbierta === null || estadoConsulta === null) return null
    if (estadoConsulta.fase === 'cargando') return { tipo: 'cargando', idDevolucion: idDevolucionAbierta }
    if (estadoConsulta.fase === 'error') {
      return {
        tipo: 'error',
        idDevolucion: idDevolucionAbierta,
        mensaje:
          estadoConsulta.error.estado === 404
            ? MENSAJE_DEVOLUCION_INEXISTENTE
            : traducirErrorConsulta(estadoConsulta.error, 'la devolución', 'ver la devolución'),
      }
    }
    const { devolucion } = estadoConsulta.consultado
    // La fila sale del propio detalle: la devolución puede no estar en la pagina que se esta viendo
    return { tipo: 'listo', devolucion, fila: crearFilaDevolucion(convertirDevolucionAListado(devolucion), ahoraServidor) }
  }
  const estadoDetalle = calcularEstadoDetalle()

  /** Busca la fila en el detalle abierto y, si no esta, en la lista. */
  const buscarFila = (idDevolucion: number): FilaDevolucion | undefined => {
    if (estadoDetalle?.tipo === 'listo' && estadoDetalle.devolucion.idDevolucion === idDevolucion) return estadoDetalle.fila
    return estadoLista.tipo === 'con-devoluciones'
      ? estadoLista.filas.find((fila) => fila.idDevolucion === idDevolucion)
      : undefined
  }

  // --- CALCULOS: FILTROS ---
  // El catalogo se pide una vez y se filtra en el dispositivo: no hay un pedido por tecla (RNF-GENERAL-02)
  const productosCoincidentes = filtrarProductosCatalogo(catalogo.datos ?? SIN_PRODUCTOS, textoBusquedaProducto)

  // --- ALTA ---
  const abrirAlta = (altaRepoblada: AltaRepoblada | null) =>
    setAlta((actual) => ({ clave: (actual?.clave ?? 0) + 1, altaRepoblada }))

  // --- EDITAR Y ANULAR ---
  const modificacion = useModificarDevolucion({
    buscarFila,
    medios,
    desfaseServidorMilisegundos,
    // La verdad la tiene el servidor: se vuelve a pedir la pagina actual y, si hay uno abierto, el detalle
    alCambiarDevolucion: () => {
      lista.refrescar()
      if (detalle.idDevolucionAbierta !== null) detalle.recargar()
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
  const solicitarAccion = (accion: 'EDITAR' | 'ANULAR', idDevolucion: number) => {
    modificacion.solicitarAccion(accion, idDevolucion)
    detalle.cerrar()
  }

  /** El alta guardo la devolución: se vuelve a pedir la pagina actual y se avisa. */
  const registrarDevolucion = (devolucion: DevolucionDetalle) => {
    lista.refrescar()
    modificacion.mostrarAviso({ mensaje: `Devolución ${devolucion.idDevolucion} registrada.` })
  }

  const propiedadesDevoluciones: DevolucionesProps = {
    estadoLista,
    propiedadesFiltros: {
      filtros: lista.filtros,
      opciones: {
        mediosPago: medios.map(({ idMedioPago, nombre }) => ({ idMedioPago, nombre })),
        textoBusquedaProducto,
        productosCoincidentes,
      },
      cantidadFiltrosActivos: contarFiltrosActivosDevoluciones(lista.filtros),
      cantidadFiltrosAdicionales: contarFiltrosAdicionalesDevoluciones(lista.filtros),
      cantidadFiltrosEnHoja: contarFiltrosEnHojaDevoluciones(lista.filtros),
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
      onVerDetalleDevolucion: detalle.abrir,
      onEditarDevolucion: (idDevolucion) => solicitarAccion('EDITAR', idDevolucion),
      onAnularDevolucion: (idDevolucion) => solicitarAccion('ANULAR', idDevolucion),
    },
    aviso: modificacion.aviso,
    detalle: estadoDetalle,
    confirmacion: modificacion.confirmacion,
    onCargarNuevaDevolucion: () => abrirAlta(null),
    onCambiarPagina: lista.cambiarPagina,
    onReintentar: lista.reintentar,
    onCerrarAviso: modificacion.cerrarAviso,
    onCerrarDetalle: detalle.cerrar,
    onReintentarDetalle: detalle.recargar,
    onConfirmarAccionDevolucion: () => void modificacion.confirmarAccion(),
    onCancelarConfirmacion: modificacion.cancelarConfirmacion,
    onSeleccionarMotivo: modificacion.seleccionarMotivo,
    onCambiarDetalleMotivo: modificacion.cambiarDetalleMotivo,
  }

  return {
    propiedadesDevoluciones: propiedadesDevoluciones,
    alta,
    desfaseServidorMilisegundos,
    cerrarAlta: () => setAlta(null),
    registrarDevolucion: registrarDevolucion,
    refrescarLista: lista.refrescar,
    verDetalle: detalle.abrir,
  }
}
