import { descartarSiHayNulos } from '@/features/ventas/api/descartar-si-hay-nulos'
import {
  convertirTextoABasisPoints,
  convertirTextoACentavos,
  convertirTextoAMilesimas,
} from '@/features/ventas/api/conversores-numericos'
import { NUMERO_COMPROBANTE_AUSENTE } from '@/features/ventas/config/reglas-venta'
import type {
  ItemDetalleApi,
  PagoDetalleApi,
  VentaDetalleApi,
} from '@/features/ventas/types/api-ventas'
import type { MedioPago } from '@/features/ventas/types/cobro'
import type {
  ItemVentaDetalle,
  PagoVentaDetalle,
  VentaDetalle,
} from '@/features/ventas/types/historial'
import { convertirCentavosAPesos } from '@/features/ventas/utils/calcular-centavos'

const FACTOR_MILESIMAS = 1000
const PUNTOS_BASICOS_POR_PUNTO_PORCENTUAL = 100

const convertirCentavosOpcionales = (texto: string | null) =>
  texto === null ? null : convertirTextoACentavos(texto)
const convertirPesosOpcionales = (centavos: number | null) =>
  centavos === null ? null : convertirCentavosAPesos(centavos)

function convertirItem(item: ItemDetalleApi): ItemVentaDetalle | null {
  const cantidadMilesimas = convertirTextoAMilesimas(item.cantidad)
  const precioCentavos = convertirTextoACentavos(item.precioUnitario)
  const subtotalCentavos = convertirTextoACentavos(item.subtotal)
  if (cantidadMilesimas === null || precioCentavos === null || subtotalCentavos === null) return null
  return {
    idProducto: item.idProducto,
    nombreProducto: item.nombreProducto,
    formatoVenta: item.formatoVenta,
    cantidad: cantidadMilesimas / FACTOR_MILESIMAS,
    precioUnitario: convertirCentavosAPesos(precioCentavos),
    subtotal: convertirCentavosAPesos(subtotalCentavos),
  }
}

/**
 * Convierte un pago. El detalle no trae el tipo del medio: si admite vuelto se sabe cruzando el id con los
 * medios cargados; si el medio ya no esta entre los activos, se deduce de que haya un monto recibido.
 */
function convertirPago(pago: PagoDetalleApi, medios: MedioPago[]): PagoVentaDetalle | null {
  const baseCentavos = convertirTextoACentavos(pago.montoBase)
  const finalCentavos = convertirTextoACentavos(pago.montoFinal)
  const puntosBasicos = convertirTextoABasisPoints(pago.porcentajeAplicado)
  const recibidoCentavos = convertirCentavosOpcionales(pago.montoRecibido)
  const vueltoCentavos = convertirCentavosOpcionales(pago.vuelto)
  if (baseCentavos === null || finalCentavos === null || puntosBasicos === null) return null
  // Un recibido o un vuelto que vinieron con texto pero no son numeros invalidan el pago
  if (pago.montoRecibido !== null && recibidoCentavos === null) return null
  if (pago.vuelto !== null && vueltoCentavos === null) return null

  const medio = medios.find((candidato) => candidato.idMedioPago === pago.idMedioPago)
  return {
    idMedioPago: pago.idMedioPago,
    nombreMedioPago: pago.nombreMedioPago,
    montoBase: convertirCentavosAPesos(baseCentavos),
    porcentajeAplicado: puntosBasicos / PUNTOS_BASICOS_POR_PUNTO_PORCENTUAL,
    montoFinal: convertirCentavosAPesos(finalCentavos),
    admiteVuelto: medio?.admiteVuelto ?? recibidoCentavos !== null,
    montoRecibido: convertirPesosOpcionales(recibidoCentavos),
    vuelto: convertirPesosOpcionales(vueltoCentavos),
  }
}

/**
 * Traduce el detalle del back (cualquier estado, tambien ANULADA) a la venta del Historial: montos en pesos
 * con centavos, cantidades numericas y, en un numero de comprobante ausente, un texto de respaldo.
 * Devuelve null si algun numero no se puede leer.
 */
export function convertirDetalleApiAVentaDetalle(
  venta: VentaDetalleApi,
  medios: MedioPago[],
): VentaDetalle | null {
  const montoTotalCentavos = convertirTextoACentavos(venta.montoTotal)
  const subtotalCentavos = convertirTextoACentavos(venta.subtotalBruto)
  const descuentoCentavos = convertirTextoACentavos(venta.descuentoManual)
  if (montoTotalCentavos === null || subtotalCentavos === null || descuentoCentavos === null) return null

  const items = descartarSiHayNulos(venta.items.map(convertirItem))
  const pagos = descartarSiHayNulos(venta.pagos.map((pago) => convertirPago(pago, medios)))
  if (items === null || pagos === null) return null

  return {
    idVenta: venta.idVenta,
    numeroComprobante: venta.numeroComprobante ?? NUMERO_COMPROBANTE_AUSENTE,
    fechaHora: venta.fechaHora,
    estado: venta.estado,
    montoTotal: convertirCentavosAPesos(montoTotalCentavos),
    clienteReferencia: venta.clienteReferencia,
    origen: venta.origen,
    modalidadEntrega: venta.modalidadEntrega,
    fechaHoraLimiteModificacion: venta.fechaHoraLimiteModificacion,
    anulacion:
      venta.anulacion === null
        ? null
        : {
            motivo: venta.anulacion.motivo,
            idUsuario: venta.anulacion.usuario.idUsuario,
            nombreUsuario: venta.anulacion.usuario.nombre,
            fechaHora: venta.anulacion.fechaHora,
          },
    fechaHoraPago: venta.fechaHoraPago,
    vendedor: venta.vendedor,
    subtotalBruto: convertirCentavosAPesos(subtotalCentavos),
    descuentoManual: convertirCentavosAPesos(descuentoCentavos),
    motivoDescuento: venta.motivoDescuento,
    items,
    pagos,
  }
}
