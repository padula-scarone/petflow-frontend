import type { VarianteFiltro } from '@/features/ventas/components/etiqueta-filtro'
import { FiltroSelector } from '@/features/ventas/components/filtro-selector'
import type { OpcionProximoPago } from '@/features/ventas/deudores/types/cuenta-corriente'
import type { OpcionSelector } from '@/features/ventas/types/compartidos'

/** Props del filtro por proximo pago. */
interface FiltroProximoPagoProps {
  idCampo: string
  /** barra: sin etiqueta visible (escritorio). hoja: con etiqueta (hoja de filtros de celular). */
  variante: VarianteFiltro
  proximoPago: OpcionProximoPago | null
  onCambiarProximoPago: (proximoPago: OpcionProximoPago | null) => void
}

const OPCIONES_PROXIMO_PAGO: OpcionSelector<OpcionProximoPago>[] = [
  { valor: 'ESTA_SEMANA', etiqueta: 'Paga esta semana' },
  { valor: 'HOY', etiqueta: 'Paga hoy' },
  { valor: 'VENCIDOS', etiqueta: 'Pagos atrasados' },
  { valor: 'SIN_FECHA', etiqueta: 'Pagos sin fecha' },
]

/** Filtro por proximo pago: el selector generico con las opciones de Deudores. */
export function FiltroProximoPago({ idCampo, variante, proximoPago, onCambiarProximoPago }: FiltroProximoPagoProps) {
  return (
    <FiltroSelector
      idCampo={idCampo}
      variante={variante}
      etiqueta="Próximo pago"
      etiquetaTodos="Todos los pagos"
      opciones={OPCIONES_PROXIMO_PAGO}
      valor={proximoPago}
      onCambiarValor={onCambiarProximoPago}
    />
  )
}
