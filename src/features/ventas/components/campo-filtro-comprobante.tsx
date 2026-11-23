import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

/** Props del buscador por numero de comprobante. */
interface CampoFiltroComprobanteProps {
  idCampo: string
  numeroComprobante: string
  onCambiarNumeroComprobante: (numeroComprobante: string) => void
}

/** Buscador del Historial: siempre a la vista, sin etiqueta (el placeholder y el aria-label dicen que es). */
export function CampoFiltroComprobante({
  idCampo,
  numeroComprobante,
  onCambiarNumeroComprobante,
}: CampoFiltroComprobanteProps) {
  return (
    <div className="relative min-w-0">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-texto-suave"
      />
      <Input
        id={idCampo}
        type="text"
        autoComplete="off"
        aria-label="N.º de comprobante"
        placeholder="N.º comprobante"
        className="bg-fondo-tarjeta pl-10 tabular-nums"
        value={numeroComprobante}
        onChange={(evento) => onCambiarNumeroComprobante(evento.target.value)}
        onKeyDown={(evento) => {
          if (evento.key === 'Escape' && numeroComprobante !== '') {
            evento.stopPropagation()
            onCambiarNumeroComprobante('')
          }
        }}
      />
    </div>
  )
}
