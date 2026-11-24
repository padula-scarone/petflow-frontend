import { HandCoins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Props del boton que pasa al cobro de los fiados tildados. */
interface BotonCobrarFiadosProps {
  habilitado: boolean
  onCobrarFiados: () => void
  className?: string
}

/** Boton principal de la ficha. Verde, como CONFIRMAR en Registrar Venta: es dinero que entra a la caja. */
export function BotonCobrarFiados({ habilitado, onCobrarFiados, className }: BotonCobrarFiadosProps) {
  return (
    <Button
      type="button"
      variant="exito"
      size="lg"
      className={cn('min-w-0 px-4 tracking-wide', className)}
      disabled={!habilitado}
      onClick={onCobrarFiados}
    >
      COBRAR
      <HandCoins aria-hidden="true" className="size-5 lg:size-6" />
    </Button>
  )
}
