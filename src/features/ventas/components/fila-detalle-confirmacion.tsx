import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Props de una fila de la confirmacion de la venta. */
interface FilaDetalleConfirmacionProps {
  /** Lo que se nombra. En gris, salvo que traiga su propio color. */
  etiqueta: ReactNode
  /** El valor, pegado a la etiqueta. */
  dato: ReactNode
  /** Fila que depende de la de arriba (la direccion de un envio, el vuelto de un pago): va corrida a la derecha. */
  sangria?: boolean
  /** La cifra que cierra la lista: lo unico en negrita y grande. */
  destacada?: boolean
}

/**
 * Una fila de la confirmacion, "Etiqueta: dato", sin lineas ni tarjetas. Etiqueta y dato van juntos y todo alineado a
 * la izquierda: el ojo baja por un solo borde y no cruza la fila. Lo relacionado se indica corriendo la fila, no
 * separandola.
 */
export function FilaDetalleConfirmacion({
  etiqueta,
  dato,
  sangria = false,
  destacada = false,
}: FilaDetalleConfirmacionProps) {
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-1.5', sangria && 'pl-4')}>
      <dt className="text-texto-suave after:content-[':']">{etiqueta}</dt>
      <dd className={cn('min-w-0 wrap-break-word tabular-nums', destacada ? 'text-cifra-secundaria font-bold' : 'font-medium')}>
        {dato}
      </dd>
    </div>
  )
}
