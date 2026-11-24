import type { OpcionProximoPago } from '@/features/ventas/deudores/types/cuenta-corriente'

/** Las opciones del filtro, en el orden en que se ofrecen. */
export const OPCIONES_PROXIMO_PAGO: OpcionProximoPago[] = ['ESTA_SEMANA', 'HOY', 'VENCIDOS', 'SIN_FECHA']

const ETIQUETAS_PROXIMO_PAGO: Record<OpcionProximoPago, string> = {
  ESTA_SEMANA: 'Paga esta semana',
  HOY: 'Paga hoy',
  VENCIDOS: 'Pagos atrasados',
  SIN_FECHA: 'Pagos sin fecha',
}

/** El texto de una opcion del filtro por proximo pago; el mismo en el selector y en el chip. */
export function describirOpcionProximoPago(opcion: OpcionProximoPago) {
  return ETIQUETAS_PROXIMO_PAGO[opcion]
}
