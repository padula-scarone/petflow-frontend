import type { BorradorCambio, PasoAltaCambio } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { calcularResumenSaldo } from '@/features/ventas/cambios-mercaderia/utils/calcular-resumen-saldo'
import { validarCambio } from '@/features/ventas/cambios-mercaderia/utils/validar-cambio'
import type { MedioPago } from '@/features/ventas/types/cobro'

/**
 * Saldo en vivo y validacion del cambio. Se recalcula en cada render a partir del borrador, asi que
 * cambiar el peso de una bolsa abierta, una cantidad o el articulo actualiza el saldo al instante.
 * Concentra la regla de precio (solo igual o mayor valor): la vista solo muestra el resultado.
 */
export function useSaldoCambio(
  borrador: BorradorCambio,
  mediosPago: MedioPago[],
  paso: PasoAltaCambio,
) {
  // --- CALCULOS ---
  const medioSeleccionado = mediosPago.find((medio) => medio.idMedioPago === borrador.idMedioPago)
  const resumenSaldo = calcularResumenSaldo(
    borrador.articuloDevuelto,
    borrador.articuloEntregado,
    borrador.montoRecibido,
    medioSeleccionado?.admiteVuelto ?? false,
  )
  const validacion = validarCambio(borrador, resumenSaldo, medioSeleccionado, paso)

  return { medioSeleccionado, resumenSaldo, validacion }
}
