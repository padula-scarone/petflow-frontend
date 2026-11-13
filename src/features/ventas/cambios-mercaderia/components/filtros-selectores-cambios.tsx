import type { EstadoCambio, VinculoCambio } from '@/features/ventas/cambios-mercaderia/types/cambio'
import type { VarianteFiltro } from '@/features/ventas/components/etiqueta-filtro'
import { FiltroSelector } from '@/features/ventas/components/filtro-selector'
import type { OpcionSelector } from '@/features/ventas/types/compartidos'

const OPCIONES_ESTADO_CAMBIO: OpcionSelector<EstadoCambio>[] = [
  { valor: 'ACTIVO', etiqueta: 'Activo' },
  { valor: 'ANULADO', etiqueta: 'Anulado' },
]

const OPCIONES_VINCULO: OpcionSelector<VinculoCambio>[] = [
  { valor: 'VINCULADO', etiqueta: 'Con venta vinculada' },
  { valor: 'DESVINCULADO', etiqueta: 'Sin venta vinculada' },
]

/** Props del filtro por estado del cambio. */
interface FiltroEstadoCambioProps {
  idCampo: string
  variante: VarianteFiltro
  estado: EstadoCambio | null
  onCambiarEstado: (estado: EstadoCambio | null) => void
}

/** Filtro por estado: el selector generico con Activo y Anulado. */
export function FiltroEstadoCambio({ idCampo, variante, estado, onCambiarEstado }: FiltroEstadoCambioProps) {
  return (
    <FiltroSelector
      idCampo={idCampo}
      variante={variante}
      etiqueta="Estado"
      etiquetaTodos="Todos los estados"
      opciones={OPCIONES_ESTADO_CAMBIO}
      valor={estado}
      onCambiarValor={onCambiarEstado}
    />
  )
}

/** Props del filtro por vinculo con una venta. */
interface FiltroVinculoCambioProps {
  idCampo: string
  vinculo: VinculoCambio | null
  onCambiarVinculo: (vinculo: VinculoCambio | null) => void
}

/** Filtro por vinculo: vive en "Mas filtros", asi que siempre se muestra con su etiqueta. */
export function FiltroVinculoCambio({ idCampo, vinculo, onCambiarVinculo }: FiltroVinculoCambioProps) {
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
