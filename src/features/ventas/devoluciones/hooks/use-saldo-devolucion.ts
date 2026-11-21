import type { BorradorDevolucion, PasoAltaDevolucion } from '@/features/ventas/devoluciones/types/devolucion'
import { calcularResumenSaldo } from '@/features/ventas/devoluciones/utils/calcular-resumen-saldo'
import { validarDevolucion } from '@/features/ventas/devoluciones/utils/validar-devolucion'
import type { MedioPago } from '@/features/ventas/types/cobro'

/**
 * Saldo en vivo y validacion de la devolución. Se recalcula en cada render a partir del borrador, asi que
 * cambiar el peso de una bolsa abierta, una cantidad o el articulo actualiza el saldo al instante.
 * Concentra la regla de precio (solo igual o mayor valor): la vista solo muestra el resultado.
 */
export function useSaldoDevolucion(
  borrador: BorradorDevolucion,
  mediosPago: MedioPago[],
  paso: PasoAltaDevolucion,
) {
  // --- CALCULOS ---
  const medioSeleccionado = mediosPago.find((medio) => medio.idMedioPago === borrador.idMedioPago)
  const resumenSaldo = calcularResumenSaldo(
    borrador.articuloDevuelto,
    borrador.articuloEntregado,
    borrador.montoRecibido,
    medioSeleccionado?.admiteVuelto ?? false,
  )
  const validacion = validarDevolucion(borrador, resumenSaldo, medioSeleccionado, paso)

  return { medioSeleccionado, resumenSaldo, validacion }
}
