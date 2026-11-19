import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CANTIDAD_MINIMA_UNIDADES } from '@/features/ventas/config/reglas-venta'

/** Largo maximo de la cantidad tipeada: 4 cifras son hasta 9.999 unidades, mas que cualquier stock real. */
const CIFRAS_MAXIMAS_UNIDADES = 4

/** Props del campo donde se carga la cantidad de un producto que se vende por unidad. */
interface CampoCantidadUnidadesProps {
  nombreProducto: string
  /** Cantidad actual del carrito; nunca es menor al minimo. */
  unidades: number
  /** Se llama solo con una cantidad valida (entera y de al menos el minimo). */
  onCambiarUnidades: (unidades: number) => void
  onAumentar: () => void
  onDisminuir: () => void
}

/**
 * Cantidad de unidades con botones de paso. La cantidad del carrito nunca queda vacia ni en cero: mientras
 * se tipea, el campo puede estar vacio un instante (para poder borrar y escribir otro numero), pero solo se
 * informa una cantidad valida y al salir del campo vuelve a la ultima cantidad valida.
 */
export function CampoCantidadUnidades({
  nombreProducto,
  unidades,
  onCambiarUnidades,
  onAumentar,
  onDisminuir,
}: CampoCantidadUnidadesProps) {
  // Solo estado de presentacion: lo que se esta tipeando; null cuando el campo muestra la cantidad del carrito
  const [borrador, setBorrador] = useState<string | null>(null)

  const cambiarTexto = (texto: string) => {
    // Solo digitos y sin ceros a la izquierda: un 0 solo no se puede escribir
    const digitos = texto.replace(/\D/g, '').slice(0, CIFRAS_MAXIMAS_UNIDADES).replace(/^0+/, '')
    setBorrador(digitos)
    const cantidadTipeada = Number(digitos)
    if (digitos !== '' && cantidadTipeada >= CANTIDAD_MINIMA_UNIDADES) onCambiarUnidades(cantidadTipeada)
  }

  return (
    <div className="flex items-center rounded-grande border">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Disminuir cantidad de ${nombreProducto}`}
        className="size-11"
        disabled={unidades <= CANTIDAD_MINIMA_UNIDADES}
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
        aria-label={`Cantidad de ${nombreProducto}`}
        className="h-11 w-14 rounded-none border-0 px-1 text-center font-medium tabular-nums shadow-none focus-visible:ring-0"
        value={borrador ?? String(unidades)}
        // Con la cantidad seleccionada, tipear la reemplaza en lugar de sumarse a ella (un 1 + un 5 daria 15)
        onFocus={(evento) => evento.target.select()}
        onChange={(evento) => cambiarTexto(evento.target.value)}
        onBlur={() => setBorrador(null)}
      />
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
  )
}
