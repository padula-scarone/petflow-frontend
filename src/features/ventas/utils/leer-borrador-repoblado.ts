import { esObjeto } from '@/lib/es-objeto'
import type { BorradorRepoblado } from '@/features/ventas/types/borrador-repoblado'

/** Clave bajo la que viaja el borrador en el state del router. */
export const CLAVE_BORRADOR_REPOBLADO = 'borradorRepoblado'

const esNumeroFinito = (valor: unknown) => typeof valor === 'number' && Number.isFinite(valor)

function esBorradorRepoblado(valor: unknown): valor is BorradorRepoblado {
  return (
    esObjeto(valor) &&
    (valor.canalVenta === 'mostrador' || valor.canalVenta === 'digital') &&
    (valor.tipoEntrega === 'retiro' || valor.tipoEntrega === 'envio') &&
    (valor.clienteReferencia === null || typeof valor.clienteReferencia === 'string') &&
    Array.isArray(valor.items) &&
    valor.items.every(
      (item) =>
        esObjeto(item) &&
        typeof item.idProducto === 'string' &&
        typeof item.nombreProducto === 'string' &&
        esNumeroFinito(item.cantidad),
    ) &&
    (valor.descuentoManual === null ||
      (esObjeto(valor.descuentoManual) &&
        esNumeroFinito(valor.descuentoManual.monto) &&
        typeof valor.descuentoManual.motivo === 'string')) &&
    Array.isArray(valor.pagos) &&
    valor.pagos.every(
      (pago) =>
        esObjeto(pago) &&
        esNumeroFinito(pago.idMedioPago) &&
        typeof pago.nombreMedioPago === 'string' &&
        esNumeroFinito(pago.montoBase) &&
        (pago.montoRecibido === null || esNumeroFinito(pago.montoRecibido)),
    )
  )
}

/**
 * Lee el borrador del state del router. El state puede venir de cualquier lado (o de una version vieja
 * guardada por el navegador), asi que se valida antes de usarlo; si no cumple, se ignora.
 */
export function leerBorradorRepoblado(estadoRouter: unknown): BorradorRepoblado | null {
  if (!esObjeto(estadoRouter)) return null
  const borrador = estadoRouter[CLAVE_BORRADOR_REPOBLADO]
  return esBorradorRepoblado(borrador) ? borrador : null
}
