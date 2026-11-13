import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** Props del filtro por numero de comprobante. */
interface CampoFiltroComprobanteProps {
  idCampo: string
  numeroComprobante: string
  onCambiarNumeroComprobante: (numeroComprobante: string) => void
}

/** Texto libre con el formato de ejemplo del comprobante. Lleva su propia etiqueta. */
export function CampoFiltroComprobante({
  idCampo,
  numeroComprobante,
  onCambiarNumeroComprobante,
}: CampoFiltroComprobanteProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={idCampo} className="text-sm font-medium">
        N.º de comprobante
      </Label>
      <Input
        id={idCampo}
        type="text"
        autoComplete="off"
        placeholder="Ej: CMP-00001040"
        className="h-11 bg-fondo-tarjeta tabular-nums"
        value={numeroComprobante}
        onChange={(evento) => onCambiarNumeroComprobante(evento.target.value)}
      />
    </div>
  )
}
