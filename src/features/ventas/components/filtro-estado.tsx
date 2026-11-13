import { FiltroSelector } from '@/features/ventas/components/filtro-selector'
import type { VarianteFiltro } from '@/features/ventas/components/etiqueta-filtro'
import type { OpcionSelector } from '@/features/ventas/types/compartidos'
import type { EstadoVentaHistorial } from '@/features/ventas/types/historial'

/** Props del filtro por estado. */
interface FiltroEstadoProps {
  idCampo: string
  variante: VarianteFiltro
  estado: EstadoVentaHistorial | null
  onCambiarEstado: (estado: EstadoVentaHistorial | null) => void
}

const OPCIONES_ESTADO_VENTA: OpcionSelector<EstadoVentaHistorial>[] = [
  { valor: 'COMPLETADA', etiqueta: 'Completada' },
  { valor: 'PENDIENTE_PAGO', etiqueta: 'Pendiente de pago' },
  { valor: 'ANULADA', etiqueta: 'Anulada' },
]

/** Filtro por estado de venta: el selector generico con las opciones del Historial. */
export function FiltroEstado({ idCampo, variante, estado, onCambiarEstado }: FiltroEstadoProps) {
  return (
    <FiltroSelector
      idCampo={idCampo}
      variante={variante}
      etiqueta="Estado"
      etiquetaTodos="Todos los estados"
      opciones={OPCIONES_ESTADO_VENTA}
      valor={estado}
      onCambiarValor={onCambiarEstado}
    />
  )
}
