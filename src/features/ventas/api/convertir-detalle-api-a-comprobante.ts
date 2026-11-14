import { descartarSiHayNulos } from '@/features/ventas/api/descartar-si-hay-nulos'
import {
  convertirTextoABasisPoints,
  convertirTextoACentavos,
  convertirTextoAMilesimas,
} from '@/features/ventas/api/conversores-numericos'
import {
  convertirFormatoApiAFormato,
  convertirModalidadAEntrega,
  convertirOrigenACanal,
} from '@/features/ventas/api/conversores-enums'
import { MOTIVO_DESCUENTO_NO_REGISTRADO } from '@/features/ventas/config/reglas-venta'
import type {
  ItemDetalleApi,
  PagoDetalleApi,
  VentaDetalleApi,
} from '@/features/ventas/types/api-ventas'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type {
  Comprobante,
  DetalleComprobante,
  PagoComprobante,
} from '@/features/ventas/types/comprobante'
import { convertirCentavosAPesos } from '@/features/ventas/utils/calcular-centavos'

const FACTOR_MILESIMAS = 1000
const PUNTOS_BASICOS_POR_PUNTO_PORCENTUAL = 100

function convertirItem(item: ItemDetalleApi): DetalleComprobante | null {
  const cantidadMilesimas = convertirTextoAMilesimas(item.cantidad)
  const precioCentavos = convertirTextoACentavos(item.precioUnitario)
  const subtotalCentavos = convertirTextoACentavos(item.subtotal)
  if (cantidadMilesimas === null || precioCentavos === null || subtotalCentavos === null) return null
  return {
    idProducto: String(item.idProducto),
    nombreProducto: item.nombreProducto,
    formato: convertirFormatoApiAFormato(item.formatoVenta),
    cantidad: cantidadMilesimas / FACTOR_MILESIMAS,
    precioUnitario: convertirCentavosAPesos(precioCentavos),
    subtotal: convertirCentavosAPesos(subtotalCentavos),
  }
}

/**
 * Convierte un pago del detalle. El detalle no trae el tipo del medio: si admite vuelto se sabe cruzando el
 * id con los medios ya cargados. Si el medio ya no esta, se deduce de que haya o no un monto recibido
 * (sin "Paga con" no hay nada que mostrar de todos modos).
 */
function convertirPago(pago: PagoDetalleApi, medios: MedioPago[]): PagoComprobante | null {
  const baseCentavos = convertirTextoACentavos(pago.montoBase)
  const finalCentavos = convertirTextoACentavos(pago.montoFinal)
  const puntosBasicos = convertirTextoABasisPoints(pago.porcentajeAplicado)
  const recibidoCentavos = pago.montoRecibido === null ? null : convertirTextoACentavos(pago.montoRecibido)
  const vueltoCentavos = pago.vuelto === null ? null : convertirTextoACentavos(pago.vuelto)
  if (baseCentavos === null || finalCentavos === null || puntosBasicos === null) return null
  // Un recibido o un vuelto que vinieron con texto pero no son numeros invalidan el pago
  if (pago.montoRecibido !== null && recibidoCentavos === null) return null
  if (pago.vuelto !== null && vueltoCentavos === null) return null

  const datosComunes = {
    idMedioPago: pago.idMedioPago,
    nombreMedioPago: pago.nombreMedioPago,
    montoBase: convertirCentavosAPesos(baseCentavos),
    porcentajeAjuste: puntosBasicos / PUNTOS_BASICOS_POR_PUNTO_PORCENTUAL,
    montoAjuste: convertirCentavosAPesos(finalCentavos - baseCentavos),
    montoFinal: convertirCentavosAPesos(finalCentavos),
  }
  const medio = medios.find((candidato) => candidato.idMedioPago === pago.idMedioPago)
  const admiteVuelto = medio?.admiteVuelto ?? recibidoCentavos !== null

  return admiteVuelto
    ? {
        ...datosComunes,
        admiteVuelto: true,
        montoRecibido: recibidoCentavos === null ? null : convertirCentavosAPesos(recibidoCentavos),
        vuelto: vueltoCentavos === null ? null : convertirCentavosAPesos(vueltoCentavos),
      }
    : { ...datosComunes, admiteVuelto: false }
}

/**
 * Arma el Comprobante con el detalle que guardo el servidor. Devuelve null si el detalle no se puede
 * mostrar como comprobante: numeros ilegibles, venta anulada, sin numero de comprobante, fiado sin
 * cliente o venta cobrada sin pagos.
 */
export function convertirDetalleApiAComprobante(
  venta: VentaDetalleApi,
  medios: MedioPago[],
): Comprobante | null {
  if (venta.estado === 'ANULADA' || venta.numeroComprobante === null) return null

  const subtotalCentavos = convertirTextoACentavos(venta.subtotalBruto)
  const descuentoCentavos = convertirTextoACentavos(venta.descuentoManual)
  const montoTotalCentavos = convertirTextoACentavos(venta.montoTotal)
  if (subtotalCentavos === null || descuentoCentavos === null || montoTotalCentavos === null) return null

  const detalles = descartarSiHayNulos(venta.items.map(convertirItem))
  const pagos = descartarSiHayNulos(venta.pagos.map((pago) => convertirPago(pago, medios)))
  if (detalles === null || pagos === null) return null

  const datosComunes = {
    idVenta: String(venta.idVenta),
    numeroComprobante: venta.numeroComprobante,
    fechaHora: venta.fechaHora,
    canalVenta: convertirOrigenACanal(venta.origen),
    tipoEntrega: convertirModalidadAEntrega(venta.modalidadEntrega),
    nombreVendedor: venta.vendedor.nombre,
    detalles,
    descuentoManual:
      descuentoCentavos > 0
        ? {
            motivo: venta.motivoDescuento ?? MOTIVO_DESCUENTO_NO_REGISTRADO,
            monto: convertirCentavosAPesos(descuentoCentavos),
          }
        : null,
    subtotalProductos: convertirCentavosAPesos(subtotalCentavos),
    montoTotal: convertirCentavosAPesos(montoTotalCentavos),
  }

  if (venta.estado === 'PENDIENTE_PAGO') {
    if (venta.clienteReferencia === null) return null
    return { ...datosComunes, estado: 'pendiente-pago', clienteReferencia: venta.clienteReferencia }
  }

  const [primerPago, ...otrosPagos] = pagos
  if (primerPago === undefined) return null
  return {
    ...datosComunes,
    estado: 'completada',
    clienteReferencia: venta.clienteReferencia,
    pagos: [primerPago, ...otrosPagos],
  }
}
