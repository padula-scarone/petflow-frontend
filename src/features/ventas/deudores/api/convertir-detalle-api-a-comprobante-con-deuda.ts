import { descartarSiHayNulos } from '@/features/ventas/api/descartar-si-hay-nulos'
import { convertirTextoACentavos } from '@/features/ventas/api/conversores-numericos'
import { convertirModalidadAEntrega, convertirOrigenACanal } from '@/features/ventas/api/conversores-enums'
import { convertirItemApiAComprobante } from '@/features/ventas/api/convertir-detalle-api-a-comprobante'
import { MOTIVO_DESCUENTO_NO_REGISTRADO } from '@/features/ventas/config/reglas-venta'
import { convertirDeudorApi } from '@/features/ventas/deudores/api/conversores-deudores'
import type { CobroDeudorRegistrado } from '@/features/ventas/deudores/types/cobro-deudor'
import type { ComprobanteConDeuda } from '@/features/ventas/deudores/types/comprobante-con-deuda'
import type { VentaDetalleApi } from '@/features/ventas/types/api-ventas'
import { convertirCentavosAPesos, convertirPesosACentavos } from '@/features/ventas/utils/calcular-centavos'

/**
 * Arma el comprobante de una venta con deuda con el detalle que guardo el servidor mas el cobro del pago inicial, si
 * lo hubo. Lo pagado sale del cobro y no del detalle: el detalle de un fiado trae `pagos` vacio aunque ya tenga cobros.
 * Devuelve null si el detalle no se puede mostrar como comprobante de deuda: numeros ilegibles, sin comprobante, sin
 * deudor o una venta que no esta pendiente de pago.
 * @param cobroInicial El cobro del pago inicial; null en una deuda total.
 * @param avisoPagoInicial Aviso para cuando el pago inicial no quedo registrado o no se pudo confirmar.
 */
export function convertirDetalleApiAComprobanteConDeuda(
  venta: VentaDetalleApi,
  cobroInicial: CobroDeudorRegistrado | null,
  avisoPagoInicial: string | null,
): ComprobanteConDeuda | null {
  if (venta.estado !== 'PENDIENTE_PAGO' || venta.numeroComprobante === null) return null
  if (venta.deudor === undefined || venta.deudor === null) return null

  const importeCentavos = convertirTextoACentavos(venta.montoTotal)
  const descuentoCentavos = convertirTextoACentavos(venta.descuentoManual)
  const detalles = descartarSiHayNulos(venta.items.map(convertirItemApiAComprobante))
  if (importeCentavos === null || descuentoCentavos === null || detalles === null) return null

  // Lo que baja la deuda es la porcion base del pago inicial; lo cobrado ahora suma ademas los ajustes de los medios
  const abonadoCentavos = cobroInicial === null ? 0 : convertirPesosACentavos(cobroInicial.montoAbonado)
  return {
    idVenta: venta.idVenta,
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
    tipoDeuda: cobroInicial === null ? 'TOTAL' : 'PARCIAL',
    importeVenta: convertirCentavosAPesos(importeCentavos),
    montoPagadoAhora: cobroInicial === null ? 0 : cobroInicial.montoTotalCobrado,
    montoAdeudado: convertirCentavosAPesos(importeCentavos - abonadoCentavos),
    pagos: cobroInicial === null ? [] : cobroInicial.pagos,
    numeroReciboPagoInicial: cobroInicial === null ? null : cobroInicial.numeroRecibo,
    deudor: convertirDeudorApi(venta.deudor),
    fechaEstimadaPago: venta.fechaEstimadaPago ?? null,
    avisoPagoInicial,
  }
}
