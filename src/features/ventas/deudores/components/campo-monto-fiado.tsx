import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  formatearMontoParaCampo,
  limpiarTextoMonto,
  parsearTextoMonto,
} from '@/features/ventas/utils/texto-monto'

/** Props del campo con el monto a cobrar de un fiado. */
interface CampoMontoFiadoProps {
  idCampo: string
  /** Lo que lee el lector de pantalla: el campo no tiene etiqueta visible porque vive en una fila de tabla. */
  etiquetaAccesible: string
  /** null mientras el campo esta vacio. */
  valor: number | null
  /** Solo se escribe en un fiado tildado. */
  deshabilitado: boolean
  /** Mensaje de error; si hay, el campo se marca invalido y el mensaje lo describe. */
  error: string | null
  onCambiar: (monto: number | null) => void
  className?: string
}

/**
 * Monto a cobrar de un fiado, en pesos. Igual que el campo de monto del cobro, pero sin etiqueta visible y con el
 * error al lado: se usa dentro de una fila de tabla o de una tarjeta.
 */
export function CampoMontoFiado({
  idCampo,
  etiquetaAccesible,
  valor,
  deshabilitado,
  error,
  onCambiar,
  className,
}: CampoMontoFiadoProps) {
  // Se guarda lo tipeado aparte del numero: "12," tiene que seguir viendose como "12," mientras se escribe
  const [texto, setTexto] = useState(formatearMontoParaCampo(valor))
  const [valorPrevio, setValorPrevio] = useState(valor)
  // Si el valor cambia desde afuera (por ejemplo al tildar de nuevo), el campo lo muestra
  if (valor !== valorPrevio) {
    setValorPrevio(valor)
    if (parsearTextoMonto(texto) !== valor) setTexto(formatearMontoParaCampo(valor))
  }
  const idError = `${idCampo}-error`

  return (
    <div className={cn('flex flex-col gap-1', className)}>
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
          aria-label={etiquetaAccesible}
          aria-invalid={error !== null}
          aria-describedby={error !== null ? idError : undefined}
          disabled={deshabilitado}
          className="bg-fondo-tarjeta pl-7 text-right tabular-nums"
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
      {error !== null && (
        <p id={idError} role="alert" className="text-auxiliar font-medium text-peligro">
          {error}
        </p>
      )}
    </div>
  )
}
