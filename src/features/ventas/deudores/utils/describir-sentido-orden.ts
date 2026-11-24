import type { CriterioOrdenDeudores, SentidoOrden } from '@/features/ventas/deudores/types/cuenta-corriente'

const DESCRIPCIONES: Record<CriterioOrdenDeudores, Record<SentidoOrden, string>> = {
  NOMBRE: { ASCENDENTE: 'De la A a la Z', DESCENDENTE: 'De la Z a la A' },
  FIADOS_PENDIENTES: { ASCENDENTE: 'Menos fiados primero', DESCENDENTE: 'Más fiados primero' },
  SALDO: { ASCENDENTE: 'Menor saldo primero', DESCENDENTE: 'Mayor saldo primero' },
  FIADO_DESDE: { ASCENDENTE: 'Fecha más vieja primero', DESCENDENTE: 'Fecha más nueva primero' },
  PROXIMO_PAGO: { ASCENDENTE: 'Fecha más vieja primero', DESCENDENTE: 'Fecha más nueva primero' },
}

/**
 * Dice con palabras como queda ordenada la lista, para el boton que invierte el sentido: un icono solo no se
 * entiende, y en un celular no hay tooltip. Depende del dato por el que se ordena ("A a la Z" no sirve para un saldo).
 */
export function describirSentidoOrden(criterio: CriterioOrdenDeudores, sentido: SentidoOrden) {
  return DESCRIPCIONES[criterio][sentido]
}
