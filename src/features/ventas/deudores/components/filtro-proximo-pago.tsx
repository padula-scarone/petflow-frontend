import type { VarianteFiltro } from '@/features/ventas/components/etiqueta-filtro'
import { FiltroSelector } from '@/features/ventas/components/filtro-selector'
import type { OpcionProximoPago } from '@/features/ventas/deudores/types/cuenta-corriente'
import {
  describirOpcionProximoPago,
  OPCIONES_PROXIMO_PAGO,
} from '@/features/ventas/deudores/utils/describir-proximo-pago-filtro'
import type { OpcionSelector } from '@/features/ventas/types/compartidos'

/** Props del filtro por proximo pago. */
interface FiltroProximoPagoProps {
  idCampo: string
  /** barra: sin etiqueta visible (escritorio). hoja: con etiqueta (hoja de filtros de celular). */
  variante: VarianteFiltro
  proximoPago: OpcionProximoPago | null
  onCambiarProximoPago: (proximoPago: OpcionProximoPago | null) => void
}

const OPCIONES: OpcionSelector<OpcionProximoPago>[] = OPCIONES_PROXIMO_PAGO.map((valor) => ({
  valor,
  etiqueta: describirOpcionProximoPago(valor),
}))

/** Filtro por proximo pago: el selector generico con las opciones de Deudores. */
export function FiltroProximoPago({ idCampo, variante, proximoPago, onCambiarProximoPago }: FiltroProximoPagoProps) {
  return (
    <FiltroSelector
      idCampo={idCampo}
      variante={variante}
      etiqueta="Próximo pago"
      etiquetaTodos="Todos los pagos"
      opciones={OPCIONES}
      valor={proximoPago}
      onCambiarValor={onCambiarProximoPago}
    />
  )
}
