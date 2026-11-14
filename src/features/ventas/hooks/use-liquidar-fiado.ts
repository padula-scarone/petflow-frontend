import { useRef, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { cobrarFiadoApi, type CobroConfirmado } from '@/features/ventas/api/cobrar-fiado-api'
import { consultarVentaApi } from '@/features/ventas/api/consultar-venta-api'
import { convertirDetalleApiAComprobante } from '@/features/ventas/api/convertir-detalle-api-a-comprobante'
import { convertirDetalleApiAVentaDetalle } from '@/features/ventas/api/convertir-detalle-api-a-venta-detalle'
import { convertirPagosACuerpo } from '@/features/ventas/api/convertir-pagos-a-cuerpo'
import { convertirTextoACentavos } from '@/features/ventas/api/conversores-numericos'
import {
  MENSAJE_COBRO_INCIERTO,
  MENSAJE_COBRO_NO_APLICADO,
  MENSAJE_DETALLE_ILEGIBLE,
  MENSAJE_FIADO_YA_NO_PENDIENTE,
} from '@/features/ventas/config/mensajes-error-venta'
import { useCobroVenta } from '@/features/ventas/hooks/use-cobro-venta'
import { useConsultaVenta } from '@/features/ventas/hooks/use-consulta-venta'
import type { VentaDetalleApi } from '@/features/ventas/types/api-ventas'
import type { EstadoCargaRecurso } from '@/features/ventas/types/carga'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type { EstadoEnvioVenta } from '@/features/ventas/types/envio-venta'
import type {
  CobroFiadoProps,
  ErrorAccionVenta,
  FilaHistorial,
  ReciboFiado,
} from '@/features/ventas/types/historial'
import { convertirCentavosAPesos } from '@/features/ventas/utils/calcular-centavos'
import {
  construirEnlaceMail,
  construirEnlaceWhatsApp,
} from '@/features/ventas/utils/construir-enlaces-comprobante'
import {
  clasificarFalloAccion,
  crearErrorAccionVenta,
  traducirRechazoCobro,
} from '@/features/ventas/utils/traducir-error-accion-venta'
import { traducirErrorConsulta } from '@/features/ventas/utils/traducir-error-venta'
import { verificarCobroAplicado } from '@/features/ventas/utils/verificar-resultado-venta'

/** El doble toque se bloquea con un ref en este hook, asi que el cobro nunca ve un envio en curso. */
const ESTADO_ENVIO_INACTIVO: EstadoEnvioVenta = { fase: 'inactivo' }

/** Lo que necesita el hook del cobro de un fiado. */
interface OpcionesLiquidarFiado {
  fila: FilaHistorial
  /** Medios de pago activos, ya cargados por el Historial. */
  medios: MedioPago[]
  estadoMediosPago: EstadoCargaRecurso
  onReintentarMediosPago: () => void
  /** El cobro se aplico (o el servidor mostro que la venta cambio): hay que volver a pedir la lista. */
  alCambiarVenta: () => void
}

/** Importe adeudado en centavos: subtotal bruto menos descuento manual; null si algun numero es ilegible. */
function calcularImporteAdeudadoCentavos(venta: VentaDetalleApi) {
  const subtotalCentavos = convertirTextoACentavos(venta.subtotalBruto)
  const descuentoCentavos = convertirTextoACentavos(venta.descuentoManual)
  if (subtotalCentavos === null || descuentoCentavos === null) return null
  return subtotalCentavos - descuentoCentavos
}

/**
 * Cobro de un fiado (Liquidar Fiado). Pide el detalle de la venta para fijar el importe adeudado y reutiliza los
 * calculos en centavos de `useCobroVenta` (sin descuento manual ni fiado). Envia el cobro una sola vez por toque.
 * Si el resultado es incierto o el back responde 409, consulta el detalle: un cobro que si se guardo termina en
 * el recibo y no en un error. Al terminar arma el recibo (Comprobante y enlaces) con ese mismo detalle.
 */
export function useLiquidarFiado({
  fila,
  medios,
  estadoMediosPago,
  onReintentarMediosPago,
  alCambiarVenta,
}: OpcionesLiquidarFiado) {
  const { cliente } = useSesion()

  // --- ESTADOS ---
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<ErrorAccionVenta | null>(null)
  const [recibo, setRecibo] = useState<ReciboFiado | null>(null)
  const envioBloqueadoRef = useRef(false)

  // --- IMPORTE ADEUDADO ---
  const consulta = useConsultaVenta(fila.idVenta)
  const detalleConsultado = consulta.estado?.fase === 'listo' ? consulta.estado.detalle : null
  const importeCentavos =
    detalleConsultado === null ? null : calcularImporteAdeudadoCentavos(detalleConsultado.venta)
  const sigueSiendoFiado = detalleConsultado?.venta.estado === 'PENDIENTE_PAGO'
  const importeUtilizable = importeCentavos !== null && sigueSiendoFiado ? importeCentavos : 0

  const calcularEstadoImporte = (): EstadoCargaRecurso => {
    if (consulta.estado === null || consulta.estado.fase === 'cargando') {
      return { fase: 'cargando', mensajeError: null }
    }
    if (consulta.estado.fase === 'error') {
      return {
        fase: 'error',
        mensajeError: traducirErrorConsulta(consulta.estado.error, 'la venta', 'ver la venta'),
      }
    }
    if (!sigueSiendoFiado) return { fase: 'error', mensajeError: MENSAJE_FIADO_YA_NO_PENDIENTE }
    if (importeCentavos === null) return { fase: 'error', mensajeError: MENSAJE_DETALLE_ILEGIBLE }
    return { fase: 'listo', mensajeError: null }
  }
  const estadoImporte = calcularEstadoImporte()

  // Reutiliza el cobro de Registrar Venta: el dialogo no muestra descuento manual ni la opcion de fiado
  const cobro = useCobroVenta({
    subtotalCentavos: importeUtilizable,
    medios,
    estadoMediosPago,
    onReintentarMediosPago,
    estadoEnvio: ESTADO_ENVIO_INACTIVO,
  })

  // --- RECIBO ---
  /** Arma el recibo con el detalle de la venta ya cobrada; si no hay detalle, queda sin comprobante ni enlaces. */
  const mostrarRecibo = async (cobroConfirmado: CobroConfirmado, detalleYaConsultado: VentaDetalleApi | null) => {
    let venta = detalleYaConsultado
    if (venta === null) {
      const respuesta = await consultarVentaApi(cliente, String(fila.idVenta))
      venta = respuesta.exitoso ? respuesta.datos.venta : null
    }
    const comprobante = venta === null ? null : convertirDetalleApiAComprobante(venta, medios)
    setRecibo({
      comprobante,
      enlaceWhatsApp: comprobante === null ? null : construirEnlaceWhatsApp(comprobante),
      enlaceMail: comprobante === null ? null : construirEnlaceMail(comprobante),
      vuelto: cobroConfirmado.vuelto,
      montoTotalCobrado: cobroConfirmado.montoTotal,
    })
    alCambiarVenta()
  }

  /** Total y vuelto de un cobro que se confirmo consultando el detalle y no por la respuesta del POST. */
  const resumirCobroDelDetalle = (venta: VentaDetalleApi): CobroConfirmado => {
    const ventaConvertida = convertirDetalleApiAVentaDetalle(venta, medios)
    const vueltoCentavos = (ventaConvertida?.pagos ?? []).reduce(
      (suma, pago) => suma + Math.round((pago.vuelto ?? 0) * 100),
      0,
    )
    return {
      montoTotal: ventaConvertida?.montoTotal ?? convertirCentavosAPesos(importeUtilizable),
      vuelto: vueltoCentavos > 0 ? convertirCentavosAPesos(vueltoCentavos) : null,
    }
  }

  // --- ACCIONES ---
  const confirmarCobro = async () => {
    if (envioBloqueadoRef.current) return
    if (!cobro.propiedadesCobro.estadoCobro.puedeConfirmar || estadoImporte.fase !== 'listo') return
    envioBloqueadoRef.current = true
    setEnviando(true)
    setError(null)

    try {
      const pagos = convertirPagosACuerpo(cobro.datosCobro.pagos)
      const desfase = detalleConsultado?.desfaseServidorMilisegundos ?? 0
      const enviadoEnMilisegundos = Date.now() + desfase
      const respuesta = await cobrarFiadoApi(cliente, fila.idVenta, pagos)

      if (respuesta.exitoso) {
        await mostrarRecibo(respuesta.datos, null)
        return
      }
      const clasificacion = clasificarFalloAccion(respuesta.error)
      if (clasificacion === 'sin-sesion') return
      // 400, 403 y 404 son rechazos firmes: no se cobro nada
      if (clasificacion === 'rechazo' && respuesta.error.estado !== 409) {
        const rechazo = traducirRechazoCobro(respuesta.error)
        setError(rechazo)
        if (rechazo.estadoHttp === 404) alCambiarVenta()
        return
      }

      // 409 o resultado incierto: el detalle dice si ese cobro se guardo
      const verificacionPedido = await consultarVentaApi(cliente, String(fila.idVenta))
      if (!verificacionPedido.exitoso) {
        setError(crearErrorAccionVenta(null, MENSAJE_COBRO_INCIERTO, { incierto: true }))
        return
      }
      const { venta } = verificacionPedido.datos
      const verificacion = verificarCobroAplicado(venta, { pagos, enviadoEnMilisegundos })
      if (verificacion.tipo === 'aplicado') {
        await mostrarRecibo(resumirCobroDelDetalle(venta), venta)
        return
      }
      if (verificacion.tipo === 'resuelto-por-otro') {
        setError(crearErrorAccionVenta(409, MENSAJE_FIADO_YA_NO_PENDIENTE, { reintentable: false }))
        alCambiarVenta()
        return
      }
      // Sigue pendiente: un 409 firme es la falta de caja; tras un resultado incierto, el cobro no se aplico
      setError(
        clasificacion === 'incierto'
          ? crearErrorAccionVenta(null, MENSAJE_COBRO_NO_APLICADO)
          : traducirRechazoCobro(respuesta.error),
      )
    } finally {
      envioBloqueadoRef.current = false
      setEnviando(false)
    }
  }

  const propiedades: Pick<
    CobroFiadoProps,
    | 'fila'
    | 'estadoImporte'
    | 'onReintentarImporte'
    | 'importeAdeudado'
    | 'estadoMediosPago'
    | 'onReintentarMediosPago'
    | 'propiedadesCobro'
    | 'enviando'
    | 'error'
    | 'recibo'
    | 'onConfirmarCobro'
  > = {
    fila,
    estadoImporte,
    onReintentarImporte: consulta.recargar,
    importeAdeudado: convertirCentavosAPesos(importeUtilizable),
    estadoMediosPago,
    onReintentarMediosPago,
    propiedadesCobro: cobro.propiedadesCobro,
    enviando,
    error,
    recibo,
    onConfirmarCobro: confirmarCobro,
  }
  return propiedades
}
