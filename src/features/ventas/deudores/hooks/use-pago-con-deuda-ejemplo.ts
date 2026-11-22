import { useState } from 'react'
import { useUsuarioSesion } from '@/features/auth/hooks/use-usuario-sesion'
import { registrarVentaConDeudaApiEjemplo } from '@/features/ventas/deudores/ejemplos/api-deudores-ejemplo'
import { useDeudaVentaEjemplo } from '@/features/ventas/deudores/hooks/use-deuda-venta-ejemplo'
import type { ComprobanteConDeuda } from '@/features/ventas/deudores/types/comprobante-con-deuda'
import type {
  EstadoConfirmacionConDeuda,
  EstadoPagoConDeuda,
  FormaPagoAhora,
  PropiedadesPagoConDeuda,
} from '@/features/ventas/deudores/types/pago-con-deuda'
import { armarComprobanteConDeuda } from '@/features/ventas/deudores/utils/armar-comprobante-con-deuda'
import { armarPagosComprobanteConDeuda, type PagoAhora } from '@/features/ventas/deudores/utils/armar-pagos-comprobante-con-deuda'
import { calcularResumenPagoConDeuda } from '@/features/ventas/deudores/utils/calcular-resumen-pago-con-deuda'
import { evaluarPagoConDeuda } from '@/features/ventas/deudores/utils/evaluar-pago-con-deuda'
import type { PropiedadesCobroRegistrarVenta } from '@/features/ventas/types/cobro'
import type { ArticuloCarrito, CanalVenta, TipoEntrega } from '@/features/ventas/types/venta'
import {
  calcularAjusteBasisPoints,
  calcularMontoFinalCentavos,
  convertirCentavosAPesos,
  convertirPesosACentavos,
} from '@/features/ventas/utils/calcular-centavos'

/** Lo que necesita el pago con deuda de la venta en curso. */
interface OpcionesPagoConDeuda {
  articulos: ArticuloCarrito[]
  canalVenta: CanalVenta
  tipoEntrega: TipoEntrega
  /** El cobro de siempre: de el salen los medios, el descuento manual y el pago mixto. No se modifica. */
  propiedadesCobro: PropiedadesCobroRegistrarVenta
  /** Registra la venta de contado contra el back real. */
  confirmarCobro: () => Promise<void>
}

/** Monto que el vendedor escribio en "Cobrar ahora"; vale solo para el importe con el que se escribio. */
interface MontoAhoraEscrito {
  monto: number | null
  importeVentaCentavos: number
}

const MENSAJE_DEUDOR_INEXISTENTE = 'El deudor ya no existe. Elegí a otra persona para registrar la venta.'
const MENSAJE_VENTA_NO_REGISTRADA = 'No pudimos registrar la venta. No se guardó nada: intentá de nuevo.'

/**
 * Paso de pago de Registrar Venta con deuda. La forma de pago responde "con que paga ahora"; lo que no se paga
 * queda como deuda. Reutiliza el cobro de siempre para los medios, el descuento y el pago mixto, y solo agrega lo
 * nuevo: el monto parcial, "Fiar todo", el deudor y la fecha estimada.
 *
 * Una venta de contado (sin deuda) se confirma con el cobro real. Una venta con deuda se simula: el back todavia
 * no acepta pagos parciales ni deudor con fecha, y no recibe nada.
 */
export function usePagoConDeudaEjemplo({
  articulos,
  canalVenta,
  tipoEntrega,
  propiedadesCobro,
  confirmarCobro,
}: OpcionesPagoConDeuda) {
  const usuario = useUsuarioSesion()
  const deuda = useDeudaVentaEjemplo()
  const { estadoCobro } = propiedadesCobro

  // --- ESTADOS ---
  const [fiarTodo, setFiarTodo] = useState(false)
  const [montoAhoraEscrito, setMontoAhoraEscrito] = useState<MontoAhoraEscrito | null>(null)
  const [estadoConfirmacion, setEstadoConfirmacion] = useState<EstadoConfirmacionConDeuda>({ fase: 'cerrada' })
  const [comprobante, setComprobante] = useState<ComprobanteConDeuda | null>(null)

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
  const { motivoNoConfirmable: motivoPago, errorMontoAhora } = evaluarPagoConDeuda({
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
  const puedeConfirmar = motivoPago === undefined && (hayDeuda || contadoConfirmable)

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
    deuda: hayDeuda
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

  /** Lo que se pago ahora, para armar los pagos del comprobante. */
  const armarPagosAhora = (): PagoAhora[] => {
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

  const confirmarVentaConDeuda = async () => {
    const { deudorElegido, fechaEstimada } = deuda
    if (!puedeConfirmar || !hayDeuda || deudorElegido === null || fechaEstimada === null) return

    setEstadoConfirmacion({ fase: 'enviando' })
    const fechaEstimadaPago = fechaEstimada.modo === 'fecha' ? fechaEstimada.fecha : null
    try {
      const resultado = await registrarVentaConDeudaApiEjemplo({
        idDeudor: deudorElegido.idDeudor,
        importeVentaCentavos,
        pagadoAhoraBaseCentavos,
        fechaEstimadaPago,
      })
      if (resultado.tipo === 'deudor-no-encontrado') {
        setEstadoConfirmacion({ fase: 'error', estadoHttp: 404, mensaje: MENSAJE_DEUDOR_INEXISTENTE, reintentable: false })
        return
      }
      const descuentoManual = estadoCobro.descuentoManual
      setComprobante(
        armarComprobanteConDeuda({
          idVenta: resultado.idVenta,
          numeroComprobante: resultado.numeroComprobante,
          fechaHora: resultado.fechaHora,
          canalVenta,
          tipoEntrega,
          nombreVendedor: usuario.nombre,
          articulos,
          descuentoManual: descuentoManual
            ? { motivo: descuentoManual.motivo, monto: descuentoManual.montoDescontado }
            : null,
          resumen,
          pagos: armarPagosComprobanteConDeuda(armarPagosAhora(), estadoCobro.mediosDisponibles),
          deudor: deudorElegido,
          fechaEstimadaPago,
        }),
      )
      setEstadoConfirmacion({ fase: 'cerrada' })
    } catch {
      setEstadoConfirmacion({ fase: 'error', estadoHttp: null, mensaje: MENSAJE_VENTA_NO_REGISTRADA, reintentable: true })
    }
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
  }

  return { propiedadesPago, comprobante }
}
