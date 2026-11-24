import {
  TarjetaSelectorOpciones,
  type OpcionSelector,
} from '@/features/ventas/components/tarjeta-selector-opciones'
import type { CanalVenta } from '@/features/ventas/types/venta'

const OPCIONES_CANAL: OpcionSelector<CanalVenta>[] = [
  { valor: 'mostrador', etiqueta: 'Mostrador' },
  { valor: 'digital', etiqueta: 'Digital' },
]

/** Props del selector de canal de venta. La entrega se elige en el cobro, al final de la charla con el cliente. */
interface SelectorCanalVentaProps {
  canalVenta: CanalVenta
  onCambiarCanal: (canalVenta: CanalVenta) => void
}

/** Canal por el que se origino la venta, con el mismo formato que la seccion Entrega del cobro. */
export function SelectorCanalVenta({ canalVenta, onCambiarCanal }: SelectorCanalVentaProps) {
  return (
    <TarjetaSelectorOpciones
      idTitulo="titulo-canal"
      titulo="Canal"
      opciones={OPCIONES_CANAL}
      valor={canalVenta}
      onCambiar={onCambiarCanal}
    />
  )
}
