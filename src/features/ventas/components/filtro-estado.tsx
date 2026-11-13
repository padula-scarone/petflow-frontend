import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EtiquetaFiltro, type VarianteFiltro } from '@/features/ventas/components/etiqueta-filtro'
import type { EstadoVentaHistorial } from '@/features/ventas/types/historial'

/** Props del filtro por estado. */
interface FiltroEstadoProps {
  idCampo: string
  variante: VarianteFiltro
  estado: EstadoVentaHistorial | null
  onCambiarEstado: (estado: EstadoVentaHistorial | null) => void
}

export function FiltroEstado({ idCampo, variante, estado, onCambiarEstado }: FiltroEstadoProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <EtiquetaFiltro variante={variante} idCampo={idCampo}>
        Estado
      </EtiquetaFiltro>
      <Select
        value={estado ?? 'TODOS'}
        onValueChange={(valor) =>
          onCambiarEstado(valor === 'TODOS' ? null : (valor as EstadoVentaHistorial))
        }
      >
        <SelectTrigger id={idCampo} aria-label={variante === 'barra' ? 'Estado' : undefined}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TODOS">Todos los estados</SelectItem>
          <SelectItem value="COMPLETADA">Completada</SelectItem>
          <SelectItem value="PENDIENTE_PAGO">Pendiente de pago</SelectItem>
          <SelectItem value="ANULADA">Anulada</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
