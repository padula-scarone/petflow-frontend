import { cn } from '@/lib/utils'

/** Props del indicador del estado de la caja. */
interface IndicadorCajaProps {
  cajaAbierta: boolean
  className?: string
}

/**
 * Estado de la caja en una linea: punto de color y texto. El texto lleva el significado; el color
 * solo lo refuerza, para que no dependa de distinguir colores ni se lea como una notificacion.
 */
export function IndicadorCaja({ cajaAbierta, className }: IndicadorCajaProps) {
  return (
    <p
      className={cn(
        'flex items-center gap-1.5 text-xs leading-none font-medium whitespace-nowrap text-texto-suave',
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
