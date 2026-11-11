import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/** Props de un campo para ingresar un monto en pesos. */
interface CampoMontoProps {
  idCampo: string
  etiqueta: string
  /** null mientras el campo esta vacio. */
  valor: number | null
  onCambiar: (monto: number | null) => void
  className?: string
}

export function CampoMonto({
  idCampo,
  etiqueta,
  valor,
  onCambiar,
  className,
}: CampoMontoProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={idCampo} className="text-sm text-texto-suave">
        {etiqueta}
      </Label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-texto-suave tabular-nums"
        >
          $
        </span>
        <Input
          id={idCampo}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className="h-11 bg-fondo-tarjeta pl-7 tabular-nums"
          value={valor ?? ''}
          // Solo digitos: el monto se maneja como entero, sin decimales
          onChange={(evento) => {
            const soloDigitos = evento.target.value.replace(/\D/g, '')
            onCambiar(soloDigitos === '' ? null : Number(soloDigitos))
          }}
        />
      </div>
    </div>
  )
}
