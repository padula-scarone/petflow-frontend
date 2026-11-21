import { cn } from '@/lib/utils'

/** Props del indicador del estado de la caja. */
interface IndicadorCajaProps {
  cajaAbierta: boolean
  className?: string
}

/**
 * Estado de la caja como un chip, al lado del usuario: los dos son datos del puesto de trabajo. Punto de color y
 * texto; el texto lleva el significado y el color solo lo refuerza, para que no dependa de distinguir colores ni se
 * lea como una notificacion. Tiene la forma de las insignias de estado.
 */
export function IndicadorCaja({ cajaAbierta, className }: IndicadorCajaProps) {
  return (
    <p
      className={cn(
        'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border bg-fondo-tarjeta px-3 text-cuerpo font-medium whitespace-nowrap',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('size-2 shrink-0 rounded-full', cajaAbierta ? 'bg-exito' : 'bg-peligro')}
      />
      {cajaAbierta ? 'Caja abierta' : 'Caja cerrada'}
    </p>
  )
}
