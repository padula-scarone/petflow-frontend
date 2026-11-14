import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CANTIDAD_MINIMA_GRANEL_GRAMOS } from '@/features/ventas/config/reglas-venta'
import { formatearCantidad } from '@/features/ventas/utils/formatear-cantidad'

/** Largo maximo del peso tipeado: 7 cifras son hasta 9.999 kg, mas que cualquier stock real. */
const CIFRAS_MAXIMAS_GRAMOS = 7

/** Props del campo donde se carga el peso de un producto a granel. */
interface CampoPesoGranelProps {
  nombreProducto: string
  /** Peso actual del carrito, en gramos enteros; nunca es menor al minimo. */
  gramos: number
  /** Se llama solo con un peso valido (entero y de al menos el minimo). */
  onCambiarGramos: (gramos: number) => void
  onAumentar: () => void
  onDisminuir: () => void
}

/**
 * Peso en gramos con botones de paso. El peso del carrito nunca queda vacio ni en cero: mientras se
 * tipea, el campo puede estar vacio un instante (para poder borrar y escribir otro numero), pero solo
 * se informa un peso valido y al salir del campo vuelve al ultimo peso valido.
 */
export function CampoPesoGranel({
  nombreProducto,
  gramos,
  onCambiarGramos,
  onAumentar,
  onDisminuir,
}: CampoPesoGranelProps) {
  // Solo estado de presentacion: lo que se esta tipeando; null cuando el campo muestra el peso del carrito
  const [borrador, setBorrador] = useState<string | null>(null)

  const cambiarTexto = (texto: string) => {
    // Solo digitos y sin ceros a la izquierda: un 0 solo no se puede escribir
    const digitos = texto.replace(/\D/g, '').slice(0, CIFRAS_MAXIMAS_GRAMOS).replace(/^0+/, '')
    setBorrador(digitos)
    const pesoTipeado = Number(digitos)
    if (digitos !== '' && pesoTipeado >= CANTIDAD_MINIMA_GRANEL_GRAMOS) onCambiarGramos(pesoTipeado)
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center rounded-grande border">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Disminuir cantidad de ${nombreProducto}`}
          className="size-11"
          disabled={gramos <= CANTIDAD_MINIMA_GRANEL_GRAMOS}
          onClick={() => {
            setBorrador(null)
            onDisminuir()
          }}
        >
          <Minus />
        </Button>
        <Input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-label={`Peso en gramos de ${nombreProducto}`}
          className="h-11 w-20 rounded-none border-0 px-1 text-center font-medium tabular-nums shadow-none focus-visible:ring-0"
          value={borrador ?? String(gramos)}
          onChange={(evento) => cambiarTexto(evento.target.value)}
          onBlur={() => setBorrador(null)}
        />
        <span aria-hidden="true" className="pr-1 text-sm text-texto-suave">
          g
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Aumentar cantidad de ${nombreProducto}`}
          className="size-11"
          onClick={() => {
            setBorrador(null)
            onAumentar()
          }}
        >
          <Plus />
        </Button>
      </div>
      {/* El peso en kilos, que es en lo que esta el precio */}
      <span aria-live="polite" className="text-xs text-texto-suave tabular-nums">
        {formatearCantidad(gramos / 1000, 'granel')}
      </span>
    </div>
  )
}
