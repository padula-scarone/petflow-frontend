import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** Props de un campo para ingresar una cantidad (unidades o kilos). */
interface CampoCantidadProps {
  idCampo: string
  etiqueta: string
  /** null mientras el campo esta vacio. */
  valor: number | null
  /** true para kilos: admite hasta 3 decimales. false para unidades: solo enteros. */
  admiteDecimales: boolean
  /** Texto fijo a la derecha del campo: "u" o "kg". */
  unidad: string
  /** Mensaje de error del campo; se asocia con aria-describedby. */
  error?: string
  /** Ayuda debajo del campo, por ejemplo el maximo disponible. */
  ayuda?: string
  onCambiar: (cantidad: number | null) => void
}

/** Como se escribe un numero en el campo: coma decimal, sin separador de miles. */
function formatearParaCampo(valor: number | null) {
  return valor === null ? '' : String(valor).replace('.', ',')
}

/** Convierte lo escrito en un numero; vacio es null. */
function parsearDesdeCampo(texto: string) {
  if (texto === '') return null
  const numero = Number(texto.replace(',', '.'))
  return Number.isNaN(numero) ? null : numero
}

/** Deja solo lo que se puede tipear: digitos y, con decimales, una coma o punto y hasta 3 decimales. */
function limpiarTexto(texto: string, admiteDecimales: boolean) {
  if (!admiteDecimales) return texto.replace(/\D/g, '')
  const soloPermitidos = texto.replace(/[^\d.,]/g, '')
  const posicionSeparador = soloPermitidos.search(/[.,]/)
  if (posicionSeparador === -1) return soloPermitidos
  const entera = soloPermitidos.slice(0, posicionSeparador)
  const decimales = soloPermitidos.slice(posicionSeparador + 1).replace(/[.,]/g, '').slice(0, 3)
  return `${entera},${decimales}`
}

export function CampoCantidad({
  idCampo,
  etiqueta,
  valor,
  admiteDecimales,
  unidad,
  error,
  ayuda,
  onCambiar,
}: CampoCantidadProps) {
  // Se guarda lo tipeado aparte del numero: "2," tiene que seguir viendose como "2," mientras se escribe
  const [texto, setTexto] = useState(formatearParaCampo(valor))
  const [valorPrevio, setValorPrevio] = useState(valor)
  // Si el valor cambia desde afuera (por ejemplo al activar la bolsa abierta), el campo lo muestra
  if (valor !== valorPrevio) {
    setValorPrevio(valor)
    if (parsearDesdeCampo(texto) !== valor) setTexto(formatearParaCampo(valor))
  }

  const idMensaje = `${idCampo}-mensaje`
  const hayMensaje = Boolean(error) || Boolean(ayuda)

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={idCampo} className="text-sm text-texto-suave">
        {etiqueta}
      </Label>
      <div className="relative">
        <Input
          id={idCampo}
          type="text"
          inputMode={admiteDecimales ? 'decimal' : 'numeric'}
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          aria-describedby={hayMensaje ? idMensaje : undefined}
          className="h-11 bg-fondo-tarjeta pr-10 tabular-nums"
          value={texto}
          onChange={(evento) => {
            const textoLimpio = limpiarTexto(evento.target.value, admiteDecimales)
            setTexto(textoLimpio)
            const cantidad = parsearDesdeCampo(textoLimpio)
            setValorPrevio(cantidad)
            onCambiar(cantidad)
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-texto-suave"
        >
          {unidad}
        </span>
      </div>
      {hayMensaje && (
        <p id={idMensaje} className={error ? 'text-xs text-peligro' : 'text-xs text-texto-suave'}>
          {error ?? ayuda}
        </p>
      )}
    </div>
  )
}
