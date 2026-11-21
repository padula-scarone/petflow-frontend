import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Props del boton que inicia una venta nueva. */
interface BotonNuevaVentaProps {
  onNuevaVenta: () => void
  className?: string
}

export function BotonNuevaVenta({ onNuevaVenta, className }: BotonNuevaVentaProps) {
  return (
    // Morado: es una accion de navegacion, no de dinero
    <Button
      type="button"
      size="lg"
      className={cn('min-w-0 px-4 tracking-wide shadow-md', className)}
      onClick={onNuevaVenta}
    >
      NUEVA VENTA
      <Plus className="size-5 lg:size-6" />
    </Button>
  )
}
