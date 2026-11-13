import { useState } from 'react'
import { LATENCIA_REGISTRO_CAMBIO_MILISEGUNDOS } from '@/features/ventas/cambios-mercaderia/config/simulacion-cambios'
import { useBusquedaVentaEjemplo } from '@/features/ventas/cambios-mercaderia/hooks/use-busqueda-venta-ejemplo'
import { useSaldoCambio } from '@/features/ventas/cambios-mercaderia/hooks/use-saldo-cambio'
import type {
  AccionesAltaCambio,
  AltaCambioProps,
  ArticuloDevueltoCargado,
  ArticuloEntregadoCargado,
  BorradorCambio,
  CambioMercaderiaDetalle,
  CodigoMotivoCambio,
  EstadoEnvioCambio,
  PasoAltaCambio,
  VentaVinculada,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import {
  buscarProductosCambioEjemplo,
  sugerirProductosEntrega,
} from '@/features/ventas/cambios-mercaderia/utils/catalogo-cambios-ejemplo'
import { calcularValorDevuelto } from '@/features/ventas/cambios-mercaderia/utils/calcular-resumen-saldo'
import {
  aplicarBolsaAbierta,
  calcularCantidadDisponible,
  crearArticuloDevueltoDesdeCatalogo,
  crearArticuloDevueltoDesdeItem,
  crearArticuloEntregado,
} from '@/features/ventas/cambios-mercaderia/utils/crear-articulos-cambio'
import { BORRADOR_CAMBIO_VACIO } from '@/features/ventas/cambios-mercaderia/utils/estados-iniciales-cambio'
import {
  construirBodyRegistrarCambio,
  construirCambioRegistrado,
  simularRegistroCambio,
} from '@/features/ventas/cambios-mercaderia/utils/simular-servidor-cambios-ejemplo'
import { CODIGO_MOTIVO_OTRO } from '@/features/ventas/config/motivos-venta'
import { MEDIOS_EJEMPLO } from '@/features/ventas/hooks/use-cobro-venta-ejemplo'
import type { VentaDetalle } from '@/features/ventas/types/historial'

// Hook temporal del alta de un cambio: se reemplaza por el hook real de la accion Alta de Cambio.
// Errores del servidor simulados al confirmar (ver la tabla en use-cambios-posventa-ejemplo.ts).

// El motivo va primero: es lo que explica por que el cliente viene a cambiar
const ORDEN_PASOS: PasoAltaCambio[] = ['MOTIVO', 'VENTA_ORIGINAL', 'ARTICULOS', 'COBRO']

interface ParametrosAltaCambio {
  /** Base de ventas de ejemplo: de ahi salen la busqueda y el detalle de la venta a vincular. */
  ventas: VentaDetalle[]
  /** Base de cambios de ejemplo: de ahi sale lo ya devuelto por venta. */
  cambios: CambioMercaderiaDetalle[]
  /** Datos con los que se reabre el alta al editar un cambio. */
  borradorInicial: BorradorCambio | null
  /** El cambio quedo registrado: la lista lo suma a su base. */
  onCambioRegistrado: (cambio: CambioMercaderiaDetalle) => void
  onVerDetalleCambio: (idCambio: number) => void
  onCerrar: () => void
}

export function useAltaCambioEjemplo({
  ventas,
  cambios,
  borradorInicial,
  onCambioRegistrado,
  onVerDetalleCambio,
  onCerrar,
}: ParametrosAltaCambio) {
  // --- ESTADOS ---
  const [paso, setPaso] = useState<PasoAltaCambio>(borradorInicial ? 'ARTICULOS' : 'MOTIVO')
  const [borrador, setBorrador] = useState<BorradorCambio>(borradorInicial ?? BORRADOR_CAMBIO_VACIO)
  const [textoBusquedaDevuelto, setTextoBusquedaDevuelto] = useState('')
  const [textoBusquedaEntregado, setTextoBusquedaEntregado] = useState('')
  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvioCambio>({ tipo: 'inactivo' })
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false)

  // --- DERIVADOS ---
  const { medioSeleccionado, resumenSaldo, validacion } = useSaldoCambio(borrador, MEDIOS_EJEMPLO, paso)
  const hayDatosCargados =
    borrador.ventaVinculada !== null ||
    borrador.articuloDevuelto !== null ||
    borrador.articuloEntregado !== null ||
    borrador.codigoMotivo !== null

  // Productos de igual o mayor valor que lo devuelto, para no obligar a saber los precios de memoria
  const sugerenciasEntregado = sugerirProductosEntrega(calcularValorDevuelto(borrador.articuloDevuelto))

  // --- AUXILIARES ---
  const actualizarBorrador = (cambios: Partial<BorradorCambio>) =>
    setBorrador((actual) => ({ ...actual, ...cambios }))

  const actualizarArticuloDevuelto = (transformar: (articulo: ArticuloDevueltoCargado) => ArticuloDevueltoCargado) =>
    setBorrador((actual) =>
      actual.articuloDevuelto ? { ...actual, articuloDevuelto: transformar(actual.articuloDevuelto) } : actual,
    )

  const actualizarArticuloEntregado = (transformar: (articulo: ArticuloEntregadoCargado) => ArticuloEntregadoCargado) =>
    setBorrador((actual) =>
      actual.articuloEntregado ? { ...actual, articuloEntregado: transformar(actual.articuloEntregado) } : actual,
    )

  /** Cualquier cambio en lo cargado descarta un rechazo anterior del servidor: ya no corresponde. */
  const descartarErrorEnvio = () => {
    if (estadoEnvio.tipo === 'error') setEstadoEnvio({ tipo: 'inactivo' })
  }

  // --- BUSQUEDA DE VENTA ---
  const busquedaVenta = useBusquedaVentaEjemplo({
    ventas,
    cambios,
    onVentaVinculada: (venta: VentaVinculada) => {
      // Cambiar de venta invalida el articulo elegido de la anterior
      setBorrador((actual) => ({ ...actual, ventaVinculada: venta, articuloDevuelto: null }))
      setPaso('ARTICULOS')
    },
  })

  // --- ACCIONES: ARTICULOS ---
  const seleccionarArticuloVenta = (idProducto: number) => {
    const item = borrador.ventaVinculada?.items.find((candidato) => candidato.idProducto === idProducto)
    // Sin nada disponible el renglon no se puede elegir (la vista lo muestra deshabilitado)
    if (!item || calcularCantidadDisponible(item) <= 0) return
    descartarErrorEnvio()
    actualizarBorrador({ articuloDevuelto: crearArticuloDevueltoDesdeItem(item) })
  }

  const seleccionarProductoDevuelto = (idProducto: number) => {
    const producto = buscarProductosCambioEjemplo(textoBusquedaDevuelto).find((candidato) => candidato.idProducto === idProducto)
    if (!producto) return
    descartarErrorEnvio()
    actualizarBorrador({ articuloDevuelto: crearArticuloDevueltoDesdeCatalogo(producto) })
    setTextoBusquedaDevuelto('')
  }

  const seleccionarProductoEntregado = (idProducto: number) => {
    // Sale del buscador o de las sugerencias; sin stock no se puede elegir (el buscador ya lo muestra deshabilitado)
    const producto = [...buscarProductosCambioEjemplo(textoBusquedaEntregado), ...sugerenciasEntregado].find(
      (candidato) => candidato.idProducto === idProducto,
    )
    if (!producto || producto.stockDisponible <= 0) return
    descartarErrorEnvio()
    actualizarBorrador({ articuloEntregado: crearArticuloEntregado(producto) })
    setTextoBusquedaEntregado('')
  }

  // --- ACCIONES: VINCULO ---
  const desvincularVenta = () => {
    descartarErrorEnvio()
    actualizarBorrador({ ventaVinculada: null, articuloDevuelto: null })
  }

  const elegirOtraVenta = () => {
    desvincularVenta()
    setEstadoEnvio({ tipo: 'inactivo' })
    setPaso('VENTA_ORIGINAL')
  }

  // --- ACCIONES: COBRO Y MOTIVO ---
  const seleccionarMotivo = (codigoMotivo: string) =>
    setBorrador((actual) => ({
      ...actual,
      codigoMotivo: codigoMotivo as CodigoMotivoCambio,
      // El detalle solo existe con "Otro": al elegir otro motivo se descarta lo escrito
      detalleMotivo: codigoMotivo === CODIGO_MOTIVO_OTRO ? actual.detalleMotivo : '',
    }))

  // --- ACCIONES: PASOS ---
  const irAlPaso = (destino: PasoAltaCambio) => {
    setEstadoEnvio({ tipo: 'inactivo' })
    setPaso(destino)
  }

  const siguientePaso = () => {
    const siguiente = ORDEN_PASOS[ORDEN_PASOS.indexOf(paso) + 1]
    // Se sale de un paso solo si esta completo
    if (siguiente && validacion.puedeAvanzar[paso]) irAlPaso(siguiente)
  }

  const pasoAnterior = () => {
    const anterior = ORDEN_PASOS[ORDEN_PASOS.indexOf(paso) - 1]
    if (anterior) irAlPaso(anterior)
  }

  // --- ACCIONES: CONFIRMAR ---
  const confirmarCambio = () => {
    if (!validacion.puedeConfirmar || estadoEnvio.tipo === 'enviando') return
    const body = construirBodyRegistrarCambio(borrador, medioSeleccionado?.admiteVuelto ?? false, resumenSaldo.saldo)
    if (body === null) return
    setEstadoEnvio({ tipo: 'enviando' })

    setTimeout(() => {
      // El servidor manda: puede rechazar aunque el front haya validado todo
      const error = simularRegistroCambio(body)
      if (error) {
        setEstadoEnvio({ tipo: 'error', error })
        return
      }
      const idCambio = cambios.reduce((mayor, cambio) => Math.max(mayor, cambio.idCambio), 0) + 1
      const cambio = construirCambioRegistrado(borrador, resumenSaldo, medioSeleccionado, idCambio, Date.now())
      if (cambio === null) return
      onCambioRegistrado(cambio)
      setEstadoEnvio({ tipo: 'exito', cambio })
    }, LATENCIA_REGISTRO_CAMBIO_MILISEGUNDOS)
  }

  const cargarOtroCambio = () => {
    setBorrador(BORRADOR_CAMBIO_VACIO)
    setTextoBusquedaDevuelto('')
    setTextoBusquedaEntregado('')
    setEstadoEnvio({ tipo: 'inactivo' })
    setPaso('MOTIVO')
  }

  // --- ACCIONES: CIERRE ---
  const solicitarCierre = () => {
    // Mientras el servidor responde no se puede cerrar: el cambio ya esta en camino
    if (estadoEnvio.tipo === 'enviando') return
    if (estadoEnvio.tipo === 'exito' || !hayDatosCargados) return onCerrar()
    setConfirmandoDescarte(true)
  }

  const acciones: AccionesAltaCambio = {
    onDesvincularVenta: desvincularVenta,
    onElegirOtraVenta: elegirOtraVenta,
    onSeleccionarArticuloVenta: seleccionarArticuloVenta,
    onBuscarProductoDevuelto: setTextoBusquedaDevuelto,
    onSeleccionarProductoDevuelto: seleccionarProductoDevuelto,
    onCambiarCantidadDevuelta: (cantidad) => {
      descartarErrorEnvio()
      actualizarArticuloDevuelto((articulo) => ({ ...articulo, cantidad }))
    },
    onCambiarBolsaAbierta: (esBolsaAbierta) => {
      descartarErrorEnvio()
      actualizarArticuloDevuelto((articulo) => aplicarBolsaAbierta(articulo, esBolsaAbierta))
    },
    onCambiarPesoDevuelto: (pesoKg) => {
      descartarErrorEnvio()
      actualizarArticuloDevuelto((articulo) => ({ ...articulo, pesoDevueltoKg: pesoKg }))
    },
    onQuitarProductoDevuelto: () => {
      descartarErrorEnvio()
      actualizarBorrador({ articuloDevuelto: null })
    },
    onQuitarProductoEntregado: () => {
      descartarErrorEnvio()
      actualizarBorrador({ articuloEntregado: null })
    },
    onBuscarProductoEntregado: setTextoBusquedaEntregado,
    onSeleccionarProductoEntregado: seleccionarProductoEntregado,
    onCambiarCantidadEntregada: (cantidad) => {
      descartarErrorEnvio()
      actualizarArticuloEntregado((articulo) => ({ ...articulo, cantidad }))
    },
    // Cambiar de medio reinicia "Paga con": el monto de otro medio no corresponde
    onSeleccionarMedioPago: (idMedioPago) => actualizarBorrador({ idMedioPago, montoRecibido: null }),
    onCambiarMontoRecibido: (monto) => actualizarBorrador({ montoRecibido: monto }),
    onSeleccionarMotivo: seleccionarMotivo,
    onCambiarDetalleMotivo: (detalleMotivo) => actualizarBorrador({ detalleMotivo }),
    onSiguientePaso: siguientePaso,
    onPasoAnterior: pasoAnterior,
    onConfirmarCambio: confirmarCambio,
    onCargarOtroCambio: cargarOtroCambio,
    onVerDetalleCambioCreado: () => {
      if (estadoEnvio.tipo !== 'exito') return
      onVerDetalleCambio(estadoEnvio.cambio.idCambio)
      onCerrar()
    },
    onSolicitarCierre: solicitarCierre,
    onConfirmarDescarte: () => {
      setConfirmandoDescarte(false)
      onCerrar()
    },
    onCancelarDescarte: () => setConfirmandoDescarte(false),
  }

  const propiedadesAlta: AltaCambioProps = {
    abierto: true,
    paso,
    borrador,
    busquedaVenta,
    textoBusquedaDevuelto,
    textoBusquedaEntregado,
    resultadosDevuelto: buscarProductosCambioEjemplo(textoBusquedaDevuelto),
    resultadosEntregado: buscarProductosCambioEjemplo(textoBusquedaEntregado),
    sugerenciasEntregado,
    mediosPago: MEDIOS_EJEMPLO,
    resumenSaldo,
    validacion,
    estadoEnvio,
    confirmandoDescarte,
    acciones,
  }

  return propiedadesAlta
}
