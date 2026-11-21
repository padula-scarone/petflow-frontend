import { useMemo, useState } from 'react'
import { useBusquedaVentaVinculable } from '@/features/ventas/devoluciones/hooks/use-busqueda-venta-vinculable'
import { useEnvioDevolucion } from '@/features/ventas/devoluciones/hooks/use-envio-devolucion'
import { useSaldoDevolucion } from '@/features/ventas/devoluciones/hooks/use-saldo-devolucion'
import type {
  AccionesAltaDevolucion,
  AltaDevolucionProps,
  AltaRepoblada,
  ArticuloDevueltoCargado,
  ArticuloEntregadoCargado,
  BorradorDevolucion,
  DevolucionDetalle,
  CodigoMotivoDevolucion,
  PasoAltaDevolucion,
  VentaVinculada,
} from '@/features/ventas/devoluciones/types/devolucion'
import {
  buscarProductosCatalogoDevolucion,
  convertirProductoACatalogoDevolucion,
  sugerirProductosEntrega,
} from '@/features/ventas/devoluciones/utils/catalogo-devoluciones'
import { calcularValorDevuelto } from '@/features/ventas/devoluciones/utils/calcular-resumen-saldo'
import { construirCuerpoRegistrarDevolucion } from '@/features/ventas/devoluciones/utils/construir-cuerpo-registrar-devolucion'
import {
  aplicarBolsaAbierta,
  calcularCantidadDisponible,
  crearArticuloDevueltoDesdeCatalogo,
  crearArticuloDevueltoDesdeItem,
  crearArticuloEntregado,
} from '@/features/ventas/devoluciones/utils/crear-articulos-devolucion'
import { BORRADOR_DEVOLUCION_VACIA } from '@/features/ventas/devoluciones/utils/estados-iniciales-devolucion'
import { CODIGO_MOTIVO_OTRO } from '@/features/ventas/config/motivos-venta'
import { useCatalogoProductos } from '@/features/ventas/hooks/use-catalogo-productos'
import { useMediosPago } from '@/features/ventas/hooks/use-medios-pago'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type { ProductoCatalogo } from '@/features/ventas/types/venta'
import { convertirPesosACentavos } from '@/features/ventas/utils/calcular-centavos'

// El motivo va primero: es lo que explica por que el cliente viene a cambiar
const ORDEN_PASOS: PasoAltaDevolucion[] = ['MOTIVO', 'VENTA_ORIGINAL', 'ARTICULOS', 'COBRO']

// Listas vacias estables: un recurso todavia sin cargar no cambia de identidad en cada render
const SIN_MEDIOS: MedioPago[] = []
const SIN_PRODUCTOS: ProductoCatalogo[] = []

/** Lo que necesita el hook del alta. */
interface ParametrosAltaDevolucion {
  /** Datos con los que se reabre el alta al editar una devolución; null en un alta nueva. */
  altaRepoblada: AltaRepoblada | null
  /** Hora del servidor menos hora local, de la ultima respuesta de la lista. */
  desfaseServidorMilisegundos: number
  /** La devolución quedo registrada: la lista se vuelve a pedir. */
  onDevolucionRegistrada: (devolucion: DevolucionDetalle) => void
  onVerDetalleDevolucion: (idDevolucion: number) => void
  /** Se cierra el alta sin saber si la devolución se guardo: la lista se vuelve a pedir para que el usuario lo revise. */
  onActualizarLista: () => void
  onCerrar: () => void
}

/**
 * Alta de una devolución contra el back: pasos, busqueda y vinculo de la venta, articulos (productos y medios de pago
 * del back), saldo en centavos, envio y pantalla de exito. Las partes con mas logica viven en sus hooks:
 * `useBusquedaVentaVinculable`, `useSaldoDevolucion` y `useEnvioDevolucion`.
 */
export function useAltaDevolucion({
  altaRepoblada,
  desfaseServidorMilisegundos,
  onDevolucionRegistrada,
  onVerDetalleDevolucion,
  onActualizarLista,
  onCerrar,
}: ParametrosAltaDevolucion) {
  // --- DATOS DEL BACK ---
  // Se piden al montar el alta, asi el stock esta fresco cada vez que se abre
  const mediosPago = useMediosPago()
  const medios = mediosPago.datos ?? SIN_MEDIOS
  const catalogo = useCatalogoProductos()
  const catalogoDevolucion = useMemo(
    () => (catalogo.datos ?? SIN_PRODUCTOS).map(convertirProductoACatalogoDevolucion),
    [catalogo.datos],
  )

  // --- ESTADOS ---
  const [paso, setPaso] = useState<PasoAltaDevolucion>(altaRepoblada ? 'ARTICULOS' : 'MOTIVO')
  const [borrador, setBorrador] = useState<BorradorDevolucion>(altaRepoblada?.borrador ?? BORRADOR_DEVOLUCION_VACIA)
  const [textoBusquedaDevuelto, setTextoBusquedaDevuelto] = useState('')
  const [textoBusquedaEntregado, setTextoBusquedaEntregado] = useState('')
  const [confirmandoDescarte, setConfirmandoDescarte] = useState(false)

  // --- ENVIO ---
  const envio = useEnvioDevolucion({
    desfaseServidorMilisegundos,
    alRegistrar: onDevolucionRegistrada,
    // Un rechazo por stock o por un producto o medio inexistente sugiere que catalogo o medios cambiaron
    alRechazar: (error) => {
      if (error.codigo === 'STOCK_INSUFICIENTE' || (error.estadoHttp === 404 && error.codigo === 'DATOS_INVALIDOS')) {
        catalogo.recargar()
        mediosPago.recargar()
      }
    },
  })
  const { estadoEnvio } = envio

  // --- DERIVADOS ---
  const { medioSeleccionado, resumenSaldo, validacion } = useSaldoDevolucion(borrador, medios, paso)
  const hayDatosCargados =
    borrador.ventaVinculada !== null ||
    borrador.articuloDevuelto !== null ||
    borrador.articuloEntregado !== null ||
    borrador.codigoMotivo !== null

  const resultadosDevuelto = buscarProductosCatalogoDevolucion(catalogoDevolucion, textoBusquedaDevuelto)
  const resultadosEntregado = buscarProductosCatalogoDevolucion(catalogoDevolucion, textoBusquedaEntregado)
  // Productos de igual o mayor valor que lo devuelto, para no obligar a saber los precios de memoria
  const sugerenciasEntregado = sugerirProductosEntrega(catalogoDevolucion, calcularValorDevuelto(borrador.articuloDevuelto))

  // --- AUXILIARES ---
  const actualizarBorrador = (cambios: Partial<BorradorDevolucion>) =>
    setBorrador((actual) => ({ ...actual, ...cambios }))

  const actualizarArticuloDevuelto = (transformar: (articulo: ArticuloDevueltoCargado) => ArticuloDevueltoCargado) =>
    setBorrador((actual) =>
      actual.articuloDevuelto ? { ...actual, articuloDevuelto: transformar(actual.articuloDevuelto) } : actual,
    )

  const actualizarArticuloEntregado = (transformar: (articulo: ArticuloEntregadoCargado) => ArticuloEntregadoCargado) =>
    setBorrador((actual) =>
      actual.articuloEntregado ? { ...actual, articuloEntregado: transformar(actual.articuloEntregado) } : actual,
    )

  // --- BUSQUEDA DE VENTA ---
  const busquedaVenta = useBusquedaVentaVinculable({
    medios,
    catalogo: catalogo.datos,
    alVincularVenta: (venta: VentaVinculada) => {
      envio.descartarRechazo()
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
    envio.descartarRechazo()
    actualizarBorrador({ articuloDevuelto: crearArticuloDevueltoDesdeItem(item) })
  }

  const seleccionarProductoDevuelto = (idProducto: number) => {
    const producto = resultadosDevuelto.find((candidato) => candidato.idProducto === idProducto)
    if (!producto) return
    envio.descartarRechazo()
    actualizarBorrador({ articuloDevuelto: crearArticuloDevueltoDesdeCatalogo(producto) })
    setTextoBusquedaDevuelto('')
  }

  const seleccionarProductoEntregado = (idProducto: number) => {
    // Sale del buscador o de las sugerencias; sin stock no se puede elegir (el buscador ya lo muestra deshabilitado)
    const producto = [...resultadosEntregado, ...sugerenciasEntregado].find(
      (candidato) => candidato.idProducto === idProducto,
    )
    if (!producto || producto.stockDisponible <= 0) return
    envio.descartarRechazo()
    actualizarBorrador({ articuloEntregado: crearArticuloEntregado(producto) })
    setTextoBusquedaEntregado('')
  }

  // --- ACCIONES: VINCULO ---
  const desvincularVenta = () => {
    envio.descartarRechazo()
    actualizarBorrador({ ventaVinculada: null, articuloDevuelto: null })
  }

  const elegirOtraVenta = () => {
    desvincularVenta()
    envio.descartarRechazo()
    setPaso('VENTA_ORIGINAL')
  }

  // --- ACCIONES: MOTIVO ---
  const seleccionarMotivo = (codigoMotivo: string) =>
    setBorrador((actual) => ({
      ...actual,
      codigoMotivo: codigoMotivo as CodigoMotivoDevolucion,
      // El detalle solo existe con "Otro": al elegir otro motivo se descarta lo escrito
      detalleMotivo: codigoMotivo === CODIGO_MOTIVO_OTRO ? actual.detalleMotivo : '',
    }))

  // --- ACCIONES: PASOS ---
  const irAlPaso = (destino: PasoAltaDevolucion) => {
    // Un rechazo anterior del servidor se descarta al moverse; un resultado incierto no: sigue pendiente
    envio.descartarRechazo()
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
  const confirmarDevolucion = () => {
    // Una vez enviado, registrado o con resultado incierto no se vuelve a enviar
    if (!validacion.puedeConfirmar || estadoEnvio.tipo === 'enviando' || estadoEnvio.tipo === 'incierto') return
    if (estadoEnvio.tipo === 'exito') return
    const cuerpo = construirCuerpoRegistrarDevolucion(borrador, resumenSaldo, medioSeleccionado)
    if (cuerpo === null) return
    void envio.enviarDevolucion(cuerpo, convertirPesosACentavos(resumenSaldo.saldo))
  }

  const cargarOtraDevolucion = () => {
    setBorrador(BORRADOR_DEVOLUCION_VACIA)
    setTextoBusquedaDevuelto('')
    setTextoBusquedaEntregado('')
    envio.reiniciar()
    setPaso('MOTIVO')
  }

  // --- ACCIONES: CIERRE ---
  const solicitarCierre = () => {
    // Mientras el servidor responde no se puede cerrar: la devolución ya esta en camino
    if (estadoEnvio.tipo === 'enviando' || (estadoEnvio.tipo === 'incierto' && estadoEnvio.verificando)) return
    if (estadoEnvio.tipo === 'incierto') {
      // Sin saber si se guardo, se vuelve a pedir la lista para que el usuario lo revise ahi
      onActualizarLista()
      return onCerrar()
    }
    if (estadoEnvio.tipo === 'exito' || !hayDatosCargados) return onCerrar()
    setConfirmandoDescarte(true)
  }

  const acciones: AccionesAltaDevolucion = {
    onDesvincularVenta: desvincularVenta,
    onElegirOtraVenta: elegirOtraVenta,
    onSeleccionarArticuloVenta: seleccionarArticuloVenta,
    onBuscarProductoDevuelto: setTextoBusquedaDevuelto,
    onSeleccionarProductoDevuelto: seleccionarProductoDevuelto,
    onCambiarCantidadDevuelta: (cantidad) => {
      envio.descartarRechazo()
      actualizarArticuloDevuelto((articulo) => ({ ...articulo, cantidad }))
    },
    onCambiarBolsaAbierta: (esBolsaAbierta) => {
      envio.descartarRechazo()
      actualizarArticuloDevuelto((articulo) => aplicarBolsaAbierta(articulo, esBolsaAbierta))
    },
    onCambiarPesoDevuelto: (pesoKg) => {
      envio.descartarRechazo()
      actualizarArticuloDevuelto((articulo) => ({ ...articulo, pesoDevueltoKg: pesoKg }))
    },
    onQuitarProductoDevuelto: () => {
      envio.descartarRechazo()
      actualizarBorrador({ articuloDevuelto: null })
    },
    onQuitarProductoEntregado: () => {
      envio.descartarRechazo()
      actualizarBorrador({ articuloEntregado: null })
    },
    onBuscarProductoEntregado: setTextoBusquedaEntregado,
    onSeleccionarProductoEntregado: seleccionarProductoEntregado,
    onCambiarCantidadEntregada: (cantidad) => {
      envio.descartarRechazo()
      actualizarArticuloEntregado((articulo) => ({ ...articulo, cantidad }))
    },
    // Cambiar de medio reinicia "Paga con": el monto de otro medio no corresponde
    onSeleccionarMedioPago: (idMedioPago) => actualizarBorrador({ idMedioPago, montoRecibido: null }),
    onCambiarMontoRecibido: (monto) => actualizarBorrador({ montoRecibido: monto }),
    onSeleccionarMotivo: seleccionarMotivo,
    onCambiarDetalleMotivo: (detalleMotivo) => actualizarBorrador({ detalleMotivo }),
    onSiguientePaso: siguientePaso,
    onPasoAnterior: pasoAnterior,
    onConfirmarDevolucion: confirmarDevolucion,
    onVerificarEnvio: () => void envio.verificar(),
    onCargarOtraDevolucion: cargarOtraDevolucion,
    onVerDetalleDevolucionCreada: () => {
      if (estadoEnvio.tipo !== 'exito') return
      onVerDetalleDevolucion(estadoEnvio.devolucion.idDevolucion)
      onCerrar()
    },
    onSolicitarCierre: solicitarCierre,
    onConfirmarDescarte: () => {
      setConfirmandoDescarte(false)
      onCerrar()
    },
    onCancelarDescarte: () => setConfirmandoDescarte(false),
  }

  const propiedadesAlta: AltaDevolucionProps = {
    abierto: true,
    paso,
    borrador,
    busquedaVenta,
    textoBusquedaDevuelto,
    textoBusquedaEntregado,
    resultadosDevuelto,
    resultadosEntregado,
    sugerenciasEntregado,
    mediosPago: medios,
    estadoCatalogo: catalogo.estado,
    estadoMediosPago: mediosPago.estado,
    onReintentarCatalogo: catalogo.recargar,
    onReintentarMediosPago: mediosPago.recargar,
    avisosRepoblado: altaRepoblada?.avisos ?? [],
    resumenSaldo,
    validacion,
    estadoEnvio,
    confirmandoDescarte,
    acciones,
  }

  return propiedadesAlta
}
