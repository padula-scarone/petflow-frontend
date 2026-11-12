import { calcularLimiteModificacion } from '@/features/ventas/utils/calcular-plazo-modificacion'
import { crearPagoEjemplo } from '@/features/ventas/utils/crear-ventas-ejemplo'
import type {
  ErrorAccionVenta,
  PagoCobroFiado,
  VentaDetalle,
} from '@/features/ventas/types/historial'

// Temporal: simula las reglas que en la integracion aplica el back.

// --- COMPORTAMIENTOS FIJOS PARA PROBAR ---
/** Editar y anular siempre responden 403, aunque el contador diga que hay tiempo. */
export const ID_VENTA_RECHAZADA_POR_PLAZO = 1046
/** Cobrar responde 409: otro usuario ya la cobro. */
export const ID_FIADO_YA_COBRADO = 1042
/** Cobrar responde 409: no hay caja abierta. */
export const ID_FIADO_SIN_CAJA = 1041
/** Cobrar responde 404: la venta ya no existe. */
export const ID_FIADO_INEXISTENTE = 1040

const ERROR_NO_EXISTE: ErrorAccionVenta = {
  estadoHttp: 404,
  mensaje: 'La venta ya no existe. Actualizá el listado para ver los datos vigentes.',
}

/** Respuesta del servidor a editar o anular: null si la acepta, o el motivo del rechazo. */
export function simularModificacion(
  venta: VentaDetalle | undefined,
  ahoraServidorMilisegundos: number,
): ErrorAccionVenta | null {
  if (!venta) return ERROR_NO_EXISTE
  if (venta.estado === 'ANULADA') {
    return { estadoHttp: 409, mensaje: 'La venta ya estaba anulada.' }
  }
  const vencidaSegunServidor =
    venta.fechaHoraLimiteModificacion !== null &&
    ahoraServidorMilisegundos > Date.parse(venta.fechaHoraLimiteModificacion)
  if (venta.idVenta === ID_VENTA_RECHAZADA_POR_PLAZO || vencidaSegunServidor) {
    return {
      estadoHttp: 403,
      mensaje: 'El plazo de 15 minutos ya venció: la venta no se puede editar ni anular.',
    }
  }
  return null
}

/** Respuesta del servidor al cobro de un fiado: null si lo acepta, o el motivo del rechazo. */
export function simularCobroFiado(venta: VentaDetalle | undefined): ErrorAccionVenta | null {
  if (!venta || venta.idVenta === ID_FIADO_INEXISTENTE) return ERROR_NO_EXISTE
  if (venta.idVenta === ID_FIADO_YA_COBRADO || venta.estado !== 'PENDIENTE_PAGO') {
    return {
      estadoHttp: 409,
      mensaje: 'Este fiado ya fue cobrado o cambió de estado. Actualizá el listado.',
    }
  }
  if (venta.idVenta === ID_FIADO_SIN_CAJA) {
    return {
      estadoHttp: 409,
      mensaje: 'No hay una caja abierta para registrar el cobro. Abrí la caja e intentá de nuevo.',
    }
  }
  return null
}

/** Aplica el cobro a un fiado: pasa a COMPLETADA, registra los pagos y reinicia el plazo desde el pago. */
export function construirVentaCobrada(
  venta: VentaDetalle,
  pagosCobro: PagoCobroFiado[],
  ahoraServidorMilisegundos: number,
): VentaDetalle {
  const pagos = pagosCobro.map((pago) =>
    crearPagoEjemplo(pago.idMedioPago, pago.monto, pago.montoRecibido),
  )
  const ventaCobrada: VentaDetalle = {
    ...venta,
    estado: 'COMPLETADA',
    pagos,
    // El total final lo calcula el servidor con los recargos y descuentos del dia
    montoTotal: pagos.reduce((acumulado, pago) => acumulado + pago.montoFinal, 0),
    fechaHoraPago: new Date(ahoraServidorMilisegundos).toISOString(),
  }
  return { ...ventaCobrada, fechaHoraLimiteModificacion: calcularLimiteModificacion(ventaCobrada) }
}
