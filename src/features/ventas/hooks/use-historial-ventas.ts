import { useState } from 'react'
import { useLocation } from 'react-router'
import { convertirDetalleApiAVentaDetalle } from '@/features/ventas/api/convertir-detalle-api-a-venta-detalle'
import { MENSAJE_DETALLE_ILEGIBLE } from '@/features/ventas/config/mensajes-error-venta'
import { leerIdVentaInicialHistorial } from '@/features/ventas/config/rutas-historial'
import { useDeudaFiadoDetalle } from '@/features/ventas/deudores/hooks/use-deuda-fiado-detalle'
import { useCatalogoProductos } from '@/features/ventas/hooks/use-catalogo-productos'
import { useDetalleVenta } from '@/features/ventas/hooks/use-detalle-venta'
import { useListaHistorial } from '@/features/ventas/hooks/use-lista-historial'
import { useMediosPago } from '@/features/ventas/hooks/use-medios-pago'
import { useAnularVenta } from '@/features/ventas/hooks/use-anular-venta'
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
import {
  contarFiltrosActivos,
  contarFiltrosAdicionales,
  contarFiltrosEnHoja,
} from '@/features/ventas/utils/contar-filtros-activos'
import { detectarPeriodoRapido } from '@/features/ventas/utils/detectar-periodo-rapido'
import { filtrarProductosCatalogo } from '@/features/ventas/utils/filtrar-productos-catalogo'
import { traducirErrorConsulta } from '@/features/ventas/utils/traducir-error-venta'

// Listas vacias estables: un recurso todavia sin cargar no cambia de identidad en cada render
const SIN_MEDIOS: MedioPago[] = []
const SIN_PRODUCTOS: ProductoCatalogo[] = []

/**
 * Orquesta el Historial de ventas contra el back: lista paginada con filtros, detalle y anular. El cobro de
 * un fiado ya no vive aca: "Ver deuda" lleva a la ficha del deudor. Cada parte vive en su propio hook; aca solo se conectan y se arma lo que consume la vista.
 */
export function useHistorialVentas() {
  // --- DATOS DEL BACK COMPARTIDOS ---
  const mediosPago = useMediosPago()
  const medios = mediosPago.datos ?? SIN_MEDIOS
  const catalogo = useCatalogoProductos()

  // --- LISTA Y DETALLE ---
  const lista = useListaHistorial()
  // "Ver venta" de la ficha de un deudor entra con el detalle de esa venta ya abierto
  const { state: estadoUbicacion } = useLocation()
  const detalle = useDetalleVenta(leerIdVentaInicialHistorial(estadoUbicacion))
  const [textoBusquedaProducto, setTextoBusquedaProducto] = useState('')

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
    return { tipo: 'listo', venta, fila: crearFilaHistorial(venta, ahoraServidor), deudaFiado: null }
  }
  const estadoDetalleBase = calcularEstadoDetalle()
  // Lo que falta de un fiado pendiente con deudor sale de la ficha del deudor: la lista y el detalle no lo traen
  const deudaFiado = useDeudaFiadoDetalle(estadoDetalleBase?.tipo === 'listo' ? estadoDetalleBase.venta : null)
  const estadoDetalle: EstadoDetalleVenta | null =
    estadoDetalleBase?.tipo === 'listo'
      ? { ...estadoDetalleBase, deudaFiado: deudaFiado.deudaFiado }
      : estadoDetalleBase

  /** Busca la fila en el detalle abierto y, si no esta, en la lista. */
  const buscarFila = (idVenta: number): FilaHistorial | undefined => {
    if (estadoDetalle?.tipo === 'listo' && estadoDetalle.venta.idVenta === idVenta) return estadoDetalle.fila
    return estadoLista.tipo === 'con-ventas'
      ? estadoLista.filas.find((fila) => fila.idVenta === idVenta)
      : undefined
  }

  // --- CALCULOS: FILTROS ---
  const productosCoincidentes = filtrarProductosCatalogo(catalogo.datos ?? SIN_PRODUCTOS, textoBusquedaProducto)

  // --- ANULAR ---
  const anulacion = useAnularVenta({
    buscarFila,
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
      cantidadFiltrosEnHoja: contarFiltrosEnHoja(lista.filtros),
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
      onSolicitarAnulacion: anulacion.solicitarAnulacion,
    },
    aviso: anulacion.aviso,
    detalle: estadoDetalle,
    confirmacion: anulacion.confirmacion,
    onCambiarPagina: lista.cambiarPagina,
    onReintentar: lista.reintentar,
    onCerrarAviso: anulacion.cerrarAviso,
    onCerrarDetalle: detalle.cerrar,
    onReintentarDetalle: detalle.recargar,
    onReintentarDeudaFiado: deudaFiado.reintentar,
    onAnularVenta: () => void anulacion.confirmarAnulacion(),
    onCancelarConfirmacion: anulacion.cancelarConfirmacion,
    onSeleccionarMotivo: anulacion.seleccionarMotivo,
    onCambiarDetalleMotivo: anulacion.cambiarDetalleMotivo,
  }

  return { propiedadesHistorial }
}
