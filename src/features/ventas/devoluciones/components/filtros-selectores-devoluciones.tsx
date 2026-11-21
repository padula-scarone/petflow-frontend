import type { EstadoDevolucion, VinculoDevolucion } from '@/features/ventas/devoluciones/types/devolucion'
import type { VarianteFiltro } from '@/features/ventas/components/etiqueta-filtro'
import { FiltroSelector } from '@/features/ventas/components/filtro-selector'
import type { OpcionSelector } from '@/features/ventas/types/compartidos'

const OPCIONES_ESTADO_DEVOLUCION: OpcionSelector<EstadoDevolucion>[] = [
  { valor: 'ACTIVO', etiqueta: 'Activa' },
  { valor: 'ANULADO', etiqueta: 'Anulada' },
]

const OPCIONES_VINCULO: OpcionSelector<VinculoDevolucion>[] = [
  { valor: 'VINCULADO', etiqueta: 'Con venta vinculada' },
  { valor: 'DESVINCULADO', etiqueta: 'Sin venta vinculada' },
]

/** Props del filtro por estado de la devolución. */
interface FiltroEstadoDevolucionProps {
  idCampo: string
  variante: VarianteFiltro
  estado: EstadoDevolucion | null
  onCambiarEstado: (estado: EstadoDevolucion | null) => void
}

/** Filtro por estado: el selector generico con Activa y Anulada. */
export function FiltroEstadoDevolucion({ idCampo, variante, estado, onCambiarEstado }: FiltroEstadoDevolucionProps) {
  return (
    <FiltroSelector
      idCampo={idCampo}
      variante={variante}
      etiqueta="Estado"
      etiquetaTodos="Todos los estados"
      opciones={OPCIONES_ESTADO_DEVOLUCION}
      valor={estado}
      onCambiarValor={onCambiarEstado}
    />
  )
}

/** Props del filtro por vinculo con una venta. */
interface FiltroVinculoDevolucionProps {
  idCampo: string
  vinculo: VinculoDevolucion | null
  onCambiarVinculo: (vinculo: VinculoDevolucion | null) => void
}

/** Filtro por vinculo: vive en "Mas filtros", asi que siempre se muestra con su etiqueta. */
export function FiltroVinculoDevolucion({ idCampo, vinculo, onCambiarVinculo }: FiltroVinculoDevolucionProps) {
  return (
    <FiltroSelector
      idCampo={idCampo}
      variante="hoja"
      etiqueta="Venta vinculada"
      etiquetaTodos="Todos"
      opciones={OPCIONES_VINCULO}
      valor={vinculo}
      onCambiarValor={onCambiarVinculo}
    />
  )
}
