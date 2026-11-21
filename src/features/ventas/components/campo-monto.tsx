import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  formatearMontoParaCampo,
  limpiarTextoMonto,
  parsearTextoMonto,
} from '@/features/ventas/utils/texto-monto'

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
  // Se guarda lo tipeado aparte del numero: "12," tiene que seguir viendose como "12," mientras se escribe
  const [texto, setTexto] = useState(formatearMontoParaCampo(valor))
  const [valorPrevio, setValorPrevio] = useState(valor)
  // Si el valor cambia desde afuera (por ejemplo al completar con lo que falta), el campo lo muestra
  if (valor !== valorPrevio) {
    setValorPrevio(valor)
    if (parsearTextoMonto(texto) !== valor) setTexto(formatearMontoParaCampo(valor))
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={idCampo} className="text-cuerpo text-texto-suave">
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
          inputMode="decimal"
          autoComplete="off"
          className="bg-fondo-tarjeta pl-7 tabular-nums"
          value={texto}
          onChange={(evento) => {
            const textoLimpio = limpiarTextoMonto(evento.target.value)
            const monto = parsearTextoMonto(textoLimpio)
            setTexto(textoLimpio)
            setValorPrevio(monto)
            onCambiar(monto)
          }}
          // Al salir del campo se completan los decimales: "1500" queda "1500,00"
          onBlur={() => setTexto(formatearMontoParaCampo(parsearTextoMonto(texto)))}
        />
      </div>
    </div>
  )
}
