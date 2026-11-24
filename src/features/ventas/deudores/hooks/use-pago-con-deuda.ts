import { useRef, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { consultarHistorialApi } from '@/features/ventas/api/consultar-historial-api'
import { consultarVentaApi } from '@/features/ventas/api/consultar-venta-api'
import { registrarVentaApi } from '@/features/ventas/api/registrar-venta-api'
import { CANTIDAD_POR_PAGINA_HISTORIAL } from '@/features/ventas/config/reglas-venta'
import { convertirDetalleApiAComprobanteConDeuda } from '@/features/ventas/deudores/api/convertir-detalle-api-a-comprobante-con-deuda'
import {
  consultarCobroApi,
  consultarEstadoCuentaApi,
  registrarCobroApi,
} from '@/features/ventas/deudores/api/cuentas-corrientes-api'
import {
  AVISO_COMPROBANTE_PAGO_INCIERTO,
  AVISO_COMPROBANTE_PAGO_NO_REGISTRADO,
  MENSAJE_COMPROBANTE_PENDIENTE,
  MENSAJE_FIADO_INCIERTO,
  MENSAJE_FIADO_NO_ENCONTRADO_TRAS_FALLO,
  MENSAJE_PAGO_INICIAL_INCIERTO,
  MENSAJE_PAGO_INICIAL_NO_REGISTRADO,
} from '@/features/ventas/deudores/config/mensajes-deudores'
import { useDeudaVenta } from '@/features/ventas/deudores/hooks/use-deuda-venta'
import type { RegistrarCobroRequest } from '@/features/ventas/deudores/types/api-deudores'
import type { CobroDeudorRegistrado } from '@/features/ventas/deudores/types/cobro-deudor'
import type { ComprobanteConDeuda } from '@/features/ventas/deudores/types/comprobante-con-deuda'
import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import type {
  EstadoConfirmacionConDeuda,
  EstadoPagoConDeuda,
  FechaEstimadaPago,
  FormaPagoAhora,
  PropiedadesPagoConDeuda,
} from '@/features/ventas/deudores/types/pago-con-deuda'
import { calcularResumenPagoConDeuda } from '@/features/ventas/deudores/utils/calcular-resumen-pago-con-deuda'
import { evaluarPagoConDeuda } from '@/features/ventas/deudores/utils/evaluar-pago-con-deuda'
import { obtenerFechaHoy } from '@/features/ventas/deudores/utils/fechas-estimadas'
import { completarCobroConsultado } from '@/features/ventas/deudores/utils/armar-recibo-cobro-deudor'
import { traducirErrorAltaFiado, traducirErrorCobro } from '@/features/ventas/deudores/utils/traducir-error-deudores'
import {
  buscarFiadoRegistrado,
  verificarCobroEnFicha,
} from '@/features/ventas/deudores/utils/verificar-resultado-deuda'
import type { PropiedadesCobroRegistrarVenta } from '@/features/ventas/types/cobro'
import type { SolicitudVenta, PagoSolicitud } from '@/features/ventas/types/solicitud-venta'
import type { ArticuloCarrito, CanalVenta, TipoEntrega } from '@/features/ventas/types/venta'
import {
  calcularAjusteBasisPoints,
  calcularMontoFinalCentavos,
  convertirCentavosAPesos,
  convertirPesosACentavos,
} from '@/features/ventas/utils/calcular-centavos'
import { FILTROS_HISTORIAL_VACIOS } from '@/features/ventas/utils/contar-filtros-activos'

/** Lo que necesita el pago con deuda de la venta en curso. */
interface OpcionesPagoConDeuda {
  articulos: ArticuloCarrito[]
  canalVenta: CanalVenta
  tipoEntrega: TipoEntrega
  /** El cobro de siempre: de el salen los medios, el descuento manual y el pago mixto. No se modifica. */
  propiedadesCobro: PropiedadesCobroRegistrarVenta
  /** Registra la venta de contado contra el back real. */
  confirmarCobro: () => Promise<void>
  /** Descarta la venta en curso y vuelve al carrito vacio: lo usa quien ya no puede reenviarla sin riesgo. */
  alAbandonarVenta: () => void
}

/** Monto que el vendedor escribio en "Cobrar ahora"; vale solo para el importe con el que se escribio. */
interface MontoAhoraEscrito {
  monto: number | null
  importeVentaCentavos: number
}

/**
 * Paso de pago de Registrar Venta con deuda. La forma de pago responde "con que paga ahora"; lo que no se paga
 * queda como deuda. Reutiliza el cobro de siempre para los medios, el descuento y el pago mixto, y solo agrega lo
 * nuevo: el monto parcial, "Fiar todo", el deudor y la fecha estimada.
 *
 * Una venta de contado se confirma con el cobro real de siempre. Una venta con deuda son DOS llamadas, que no son
 * atomicas: (1) POST /api/ventas con pagos vacios, el deudor y la fecha estimada; (2) si se pago algo ahora,
 * POST /api/cuentas-corrientes/:idDeudor/cobros con ese fiado y los medios. Si el paso 1 funciona y el paso 2 falla, la
 * venta YA existe como deuda total: nunca se reenvia el POST de la venta, solo se reintenta el pago (o se sigue sin el).
 */
export function usePagoConDeuda({
  articulos,
  canalVenta,
  tipoEntrega,
  propiedadesCobro,
  confirmarCobro,
  alAbandonarVenta,
}: OpcionesPagoConDeuda) {
  const { cliente } = useSesion()
  const deuda = useDeudaVenta()
  const { estadoCobro } = propiedadesCobro

  // --- ESTADOS ---
  const [fiarTodo, setFiarTodo] = useState(false)
  const [montoAhoraEscrito, setMontoAhoraEscrito] = useState<MontoAhoraEscrito | null>(null)
  const [estadoConfirmacion, setEstadoConfirmacion] = useState<EstadoConfirmacionConDeuda>({ fase: 'cerrada' })
  const [comprobante, setComprobante] = useState<ComprobanteConDeuda | null>(null)
  // Refs y no estados: lo que ya paso en el back no se puede deshacer, y un segundo toque puede llegar antes del
  // siguiente render. Mientras alguno este cargado, el POST de la venta no vuelve a salir.
  const envioEnCursoRef = useRef(false)
  const idFiadoRegistradoRef = useRef<number | null>(null)
  const ventaInciertaRef = useRef(false)
  const cobroInicialRef = useRef<CobroDeudorRegistrado | null>(null)
  /** Aviso del comprobante cuando se sigue sin el pago inicial; null mientras no se haya decidido. */
  const avisoPagoDescartadoRef = useRef<string | null>(null)

  // --- CALCULOS ---
  const formaPago: FormaPagoAhora = estadoCobro.formaPago === 'mixto' ? 'mixto' : 'unico'
  const importeVentaCentavos =
    convertirPesosACentavos(estadoCobro.resumen.subtotalProductos) -
    convertirPesosACentavos(estadoCobro.resumen.montoDescuentoManual)
  const medioUnico = estadoCobro.mediosDisponibles.find(
    (medio) => medio.idMedioPago === estadoCobro.idMedioSeleccionado,
  )

  // Por defecto se cobra todo; el monto escrito deja de valer si cambio el importe (por ejemplo, por un descuento)
  const montoEscritoVigente =
    montoAhoraEscrito !== null && montoAhoraEscrito.importeVentaCentavos === importeVentaCentavos
      ? montoAhoraEscrito
      : null
  const montoAhoraUnico = montoEscritoVigente ? montoEscritoVigente.monto : convertirCentavosAPesos(importeVentaCentavos)

  const pagadoAhoraBaseCentavos = (() => {
    if (fiarTodo) return 0
    if (formaPago === 'unico') return convertirPesosACentavos(montoAhoraUnico ?? 0)
    return estadoCobro.lineasPagoMixto.reduce(
      (acumulado, linea) => acumulado + convertirPesosACentavos(linea.montoACubrir ?? 0),
      0,
    )
  })()
  const ajusteMediosPagoCentavos = (() => {
    if (fiarTodo) return 0
    if (formaPago === 'unico') {
      return medioUnico
        ? calcularMontoFinalCentavos(pagadoAhoraBaseCentavos, calcularAjusteBasisPoints(medioUnico)) -
            pagadoAhoraBaseCentavos
        : 0
    }
    return estadoCobro.lineasPagoMixto.reduce(
      (acumulado, linea) => acumulado + convertirPesosACentavos(linea.montoAjuste),
      0,
    )
  })()

  const resumen = calcularResumenPagoConDeuda({
    subtotalProductosCentavos: convertirPesosACentavos(estadoCobro.resumen.subtotalProductos),
    montoDescuentoManualCentavos: convertirPesosACentavos(estadoCobro.resumen.montoDescuentoManual),
    pagadoAhoraBaseCentavos,
    ajusteMediosPagoCentavos,
  })
  const cobradoAhoraCentavos = pagadoAhoraBaseCentavos + ajusteMediosPagoCentavos
  const pagaConCentavos = estadoCobro.pagaCon === null ? null : convertirPesosACentavos(estadoCobro.pagaCon)
  const vueltoUnico =
    !fiarTodo && formaPago === 'unico' && medioUnico?.admiteVuelto && pagaConCentavos !== null
      ? convertirCentavosAPesos(Math.max(pagaConCentavos - cobradoAhoraCentavos, 0))
      : null

  const hayDeuda = resumen.queDebe > 0
  // El bloque Deuda aparece recien cuando el vendedor ya eligio como paga (un medio, o "Fiar todo") y no alcanza
  const hayMedioElegido =
    fiarTodo || (formaPago === 'unico' ? medioUnico !== undefined : estadoCobro.lineasPagoMixto.length > 0)
  const mostrarDeuda = hayDeuda && hayMedioElegido
  const { confirmable, motivoNoConfirmable: motivoPago, errorMontoAhora } = evaluarPagoConDeuda({
    formaPago,
    fiarTodo,
    estadoMediosPago: propiedadesCobro.estadoMediosPago,
    resumen,
    hayMedioUnicoElegido: medioUnico !== undefined,
    medioUnicoAdmiteVuelto: medioUnico?.admiteVuelto ?? false,
    montoAhoraUnico,
    pagaConCentavos,
    cobradoAhoraCentavos,
    cantidadLineasMixto: estadoCobro.lineasPagoMixto.length,
    motivoCobroMixto: estadoCobro.motivoNoConfirmable,
    hayDeuda,
    hayDeudorElegido: deuda.deudorElegido !== null,
    hayFechaEstimadaElegida: deuda.fechaEstimada !== null,
  })
  // Sin deuda es una venta de contado: ademas se exige lo que exige el cobro real (envio posible, forma de pago valida)
  const contadoConfirmable = estadoCobro.puedeConfirmar && estadoCobro.formaPago !== 'fiado'
  const puedeConfirmar = confirmable && (hayDeuda || contadoConfirmable)

  const estadoPago: EstadoPagoConDeuda = {
    formaPago,
    fiarTodo,
    mediosDisponibles: estadoCobro.mediosDisponibles,
    idMedioSeleccionado: estadoCobro.idMedioSeleccionado,
    montoAhora: montoAhoraUnico,
    pagaCon: estadoCobro.pagaCon,
    vuelto: vueltoUnico,
    lineasPagoMixto: estadoCobro.lineasPagoMixto,
    resumen,
    deuda: mostrarDeuda
      ? {
          deudorElegido: deuda.deudorElegido,
          fechaEstimada: deuda.fechaEstimada,
          textoBusqueda: deuda.textoBusqueda,
          estadoBusqueda: deuda.estadoBusqueda,
          avisoDniExistente: deuda.avisoDniExistente,
        }
      : null,
    puedeConfirmar,
    motivoNoConfirmable: motivoPago,
    errorMontoAhora,
  }

  // --- ACCIONES ---
  /** Una venta que se cargo para editar un fiado arranca con la forma de pago "fiado": se la pasa a "unico". */
  const asegurarFormaPagoValida = () => {
    if (estadoCobro.formaPago === 'fiado') propiedadesCobro.onCambiarFormaPago('unico')
  }

  const cambiarFormaPago = (nuevaFormaPago: FormaPagoAhora) => {
    propiedadesCobro.onCambiarFormaPago(nuevaFormaPago)
    setFiarTodo(false)
    setMontoAhoraEscrito(null)
  }

  const seleccionarMedioPago = (idMedioPago: number) => {
    asegurarFormaPagoValida()
    propiedadesCobro.onSeleccionarMedioPago(idMedioPago)
    setFiarTodo(false)
  }

  const agregarLineaPago = (idMedioPago: number) => {
    propiedadesCobro.onAgregarLineaPago(idMedioPago)
    setFiarTodo(false)
  }

  /** Lo que se pago ahora, para armar los pagos del cobro. El monto es la porcion BASE de cada medio. */
  const armarPagosAhora = (): PagoSolicitud[] => {
    if (fiarTodo) return []
    if (formaPago === 'unico') {
      return medioUnico
        ? [
            {
              idMedioPago: medioUnico.idMedioPago,
              montoBaseCentavos: pagadoAhoraBaseCentavos,
              montoRecibidoCentavos: medioUnico.admiteVuelto ? pagaConCentavos : null,
            },
          ]
        : []
    }
    return estadoCobro.lineasPagoMixto.map((linea) => ({
      idMedioPago: linea.idMedioPago,
      montoBaseCentavos: convertirPesosACentavos(linea.montoACubrir ?? 0),
      montoRecibidoCentavos:
        linea.pagaCon === null ||
        !estadoCobro.mediosDisponibles.find((medio) => medio.idMedioPago === linea.idMedioPago)?.admiteVuelto
          ? null
          : convertirPesosACentavos(linea.pagaCon),
    }))
  }

  // --- ACCIONES: LOS DOS PASOS DE UNA VENTA CON DEUDA ---
  /**
   * Paso 1: registra el fiado. Devuelve el id de la venta, o null si no se registro (el estado ya dice por que).
   * Ante un resultado incierto mira el Historial antes de decidir: nunca reenvia a ciegas.
   */
  const registrarFiado = async (deudor: Deudor, fechaEstimada: FechaEstimadaPago): Promise<number | null> => {
    setEstadoConfirmacion({ fase: 'enviando', paso: 'venta' })
    const descuento = estadoCobro.descuentoManual
    const solicitud: SolicitudVenta = {
      canalVenta,
      tipoEntrega,
      items: articulos.map((articulo) => ({ idProducto: articulo.idProducto, cantidad: articulo.cantidad })),
      // Un fiado va sin pagos: lo que se pague ahora es el paso 2
      pagos: [],
      descuentoManual: descuento
        ? { montoCentavos: convertirPesosACentavos(descuento.montoDescontado), motivo: descuento.motivo.trim() }
        : null,
      clienteReferencia: null,
      idDeudor: deudor.idDeudor,
      // "Sin fecha" se omite: el back la toma como nula
      ...(fechaEstimada.modo === 'fecha' && { fechaEstimadaPago: fechaEstimada.fecha }),
    }
    const enviadoEnMilisegundos = Date.now()
    // El dia del envio, por si la verificacion cruza la medianoche
    const fechaDelEnvio = obtenerFechaHoy()

    const resultado = await registrarVentaApi(cliente, solicitud)
    if (resultado.exitoso) {
      idFiadoRegistradoRef.current = Number(resultado.datos.idVenta)
      return idFiadoRegistradoRef.current
    }

    const traduccion = traducirErrorAltaFiado(resultado.error, articulos)
    if (traduccion.tipo === 'rechazado') {
      // El back rechazo el pedido sin guardar nada: se puede corregir y reintentar
      setEstadoConfirmacion({
        fase: 'error',
        estadoHttp: traduccion.estadoHttp,
        mensaje: traduccion.mensaje,
        reintentable: traduccion.reintentable,
      })
      return null
    }

    // Resultado incierto: la venta pudo guardarse. Se busca entre las pendientes de hoy antes de decidir
    const pendientes = await consultarHistorialApi(
      cliente,
      { ...FILTROS_HISTORIAL_VACIOS, estado: 'PENDIENTE_PAGO', fechaDesde: fechaDelEnvio },
      1,
      CANTIDAD_POR_PAGINA_HISTORIAL,
    )
    if (pendientes.exitoso) {
      const encontrada = buscarFiadoRegistrado(pendientes.datos.ventas, {
        idDeudor: deudor.idDeudor,
        importeVentaCentavos,
        enviadoEnMilisegundos,
      })
      if (encontrada !== undefined) {
        idFiadoRegistradoRef.current = encontrada.idVenta
        return encontrada.idVenta
      }
      setEstadoConfirmacion({
        fase: 'error',
        estadoHttp: null,
        mensaje: MENSAJE_FIADO_NO_ENCONTRADO_TRAS_FALLO,
        reintentable: true,
      })
      return null
    }

    // No se puede saber: se bloquea el reenvio
    ventaInciertaRef.current = true
    setEstadoConfirmacion({ fase: 'venta-incierta', mensaje: MENSAJE_FIADO_INCIERTO })
    return null
  }

  /**
   * Paso 2: cobra lo que se pago ahora contra el fiado recien creado. Devuelve true si el flujo puede seguir hacia el
   * comprobante, false si quedo detenido en una decision del vendedor (el estado ya dice cual).
   */
  const cobrarPagoInicial = async (idVenta: number, deudor: Deudor): Promise<boolean> => {
    setEstadoConfirmacion({ fase: 'enviando', paso: 'pago' })
    const monto = convertirCentavosAPesos(pagadoAhoraBaseCentavos)
    const cuerpo: RegistrarCobroRequest = {
      fiados: [{ idVenta, monto }],
      pagos: armarPagosAhora().map((pago) => ({
        idMedioPago: pago.idMedioPago,
        monto: convertirCentavosAPesos(pago.montoBaseCentavos),
        ...(pago.montoRecibidoCentavos !== null && {
          montoRecibido: convertirCentavosAPesos(pago.montoRecibidoCentavos),
        }),
      })),
    }
    const enviadoEnMilisegundos = Date.now()

    const resultado = await registrarCobroApi(cliente, deudor.idDeudor, cuerpo, estadoCobro.mediosDisponibles)
    if (resultado.exitoso) {
      cobroInicialRef.current = resultado.datos
      return true
    }

    const traduccion = traducirErrorCobro(resultado.error)
    if (traduccion.tipo === 'rechazado') {
      setEstadoConfirmacion({
        fase: 'pago-no-registrado',
        mensaje: `${MENSAJE_PAGO_INICIAL_NO_REGISTRADO} ${traduccion.error.mensaje}`,
        reintentable: traduccion.error.reintentable,
        incierto: false,
      })
      return false
    }

    // Resultado incierto: el cobro pudo guardarse. La ficha dice si se aplico antes de volver a cobrar
    const cuenta = await consultarEstadoCuentaApi(cliente, deudor.idDeudor)
    if (cuenta.exitoso) {
      const verificacion = verificarCobroEnFicha(cuenta.datos, [{ idVenta, monto }], enviadoEnMilisegundos)
      if (verificacion.tipo === 'aplicado') {
        const consultado = await consultarCobroApi(cliente, verificacion.idCobroDeudor, estadoCobro.mediosDisponibles)
        if (consultado.exitoso) {
          cobroInicialRef.current = completarCobroConsultado(consultado.datos, cuenta.datos)
          return true
        }
      }
      if (verificacion.tipo === 'no-aplicado') {
        setEstadoConfirmacion({
          fase: 'pago-no-registrado',
          mensaje: MENSAJE_PAGO_INICIAL_NO_REGISTRADO,
          reintentable: true,
          incierto: false,
        })
        return false
      }
    }
    setEstadoConfirmacion({
      fase: 'pago-no-registrado',
      mensaje: MENSAJE_PAGO_INICIAL_INCIERTO,
      reintentable: false,
      incierto: true,
    })
    return false
  }

  /** Arma el comprobante con lo que guardo el servidor. Si el detalle falla, la venta ya existe: solo se reintenta esto. */
  const mostrarComprobante = async (idVenta: number) => {
    setEstadoConfirmacion({ fase: 'enviando', paso: 'comprobante' })
    const detalle = await consultarVentaApi(cliente, String(idVenta))
    const comprobanteArmado = detalle.exitoso
      ? convertirDetalleApiAComprobanteConDeuda(detalle.datos.venta, cobroInicialRef.current, avisoPagoDescartadoRef.current)
      : null
    if (comprobanteArmado === null) {
      setEstadoConfirmacion({ fase: 'comprobante-pendiente', mensaje: MENSAJE_COMPROBANTE_PENDIENTE })
      return
    }
    setComprobante(comprobanteArmado)
    setEstadoConfirmacion({ fase: 'cerrada' })
  }

  /**
   * Avanza la venta con deuda desde donde quedo: cada paso que ya se hizo no se repite. Se vuelve a llamar para
   * reintentar el pago o el comprobante sin tocar el POST de la venta.
   */
  const confirmarVentaConDeuda = async () => {
    const { deudorElegido, fechaEstimada } = deuda
    if (!puedeConfirmar || !hayDeuda || deudorElegido === null || fechaEstimada === null) return
    if (envioEnCursoRef.current || ventaInciertaRef.current) return
    envioEnCursoRef.current = true

    try {
      const idVenta = idFiadoRegistradoRef.current ?? (await registrarFiado(deudorElegido, fechaEstimada))
      if (idVenta === null) return

      const hayPagoInicialPendiente =
        pagadoAhoraBaseCentavos > 0 && cobroInicialRef.current === null && avisoPagoDescartadoRef.current === null
      if (hayPagoInicialPendiente && !(await cobrarPagoInicial(idVenta, deudorElegido))) return

      await mostrarComprobante(idVenta)
    } finally {
      envioEnCursoRef.current = false
    }
  }

  /** Sigue sin el pago inicial: la venta queda como deuda total y el comprobante lo avisa. */
  const continuarSinPagoInicial = () => {
    if (estadoConfirmacion.fase !== 'pago-no-registrado') return
    avisoPagoDescartadoRef.current = estadoConfirmacion.incierto
      ? AVISO_COMPROBANTE_PAGO_INCIERTO
      : AVISO_COMPROBANTE_PAGO_NO_REGISTRADO
    void confirmarVentaConDeuda()
  }

  const propiedadesPago: PropiedadesPagoConDeuda = {
    estadoPago,
    estadoConfirmacion,
    onCambiarFormaPago: cambiarFormaPago,
    onSeleccionarMedioPago: seleccionarMedioPago,
    onCambiarMontoAhora: (monto) => {
      setMontoAhoraEscrito({ monto, importeVentaCentavos })
      setFiarTodo(false)
    },
    onCambiarPagaCon: propiedadesCobro.onCambiarPagaCon,
    onFiarTodo: () => setFiarTodo(true),
    onCobrarAlgoAhora: () => setFiarTodo(false),
    onAgregarLineaPago: agregarLineaPago,
    onQuitarLineaPago: propiedadesCobro.onQuitarLineaPago,
    onCambiarMontoLinea: propiedadesCobro.onCambiarMontoLinea,
    onCambiarPagaConLinea: propiedadesCobro.onCambiarPagaConLinea,
    onCompletarConRestante: propiedadesCobro.onCompletarConRestante,
    onAjustarMontosAutomaticamente: propiedadesCobro.onAjustarMontosAutomaticamente,
    onBuscarDeudor: deuda.buscar,
    onReintentarBusquedaDeudor: deuda.reintentarBusqueda,
    onSeleccionarDeudor: deuda.seleccionarDeudor,
    onCambiarDeudor: deuda.cambiarDeudor,
    onCrearDeudor: deuda.crearDeudor,
    onCambiarFechaEstimada: deuda.cambiarFechaEstimada,
    onConfirmarPago: () => {
      if (!puedeConfirmar || estadoConfirmacion.fase !== 'cerrada') return
      if (hayDeuda) setEstadoConfirmacion({ fase: 'resumen' })
      else void confirmarCobro()
    },
    onCerrarResumen: () => setEstadoConfirmacion({ fase: 'cerrada' }),
    onConfirmarVentaConDeuda: () => void confirmarVentaConDeuda(),
    onContinuarSinPagoInicial: continuarSinPagoInicial,
    onAbandonarVentaIncierta: alAbandonarVenta,
  }

  return { propiedadesPago, comprobante }
}
