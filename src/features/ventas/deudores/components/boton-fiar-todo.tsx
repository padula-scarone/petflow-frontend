import { NotebookPen, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Props del boton que alterna entre "no paga nada ahora" y volver a cobrar algo. */
interface BotonFiarTodoProps {
  fiarTodo: boolean
  onFiarTodo: () => void
  onCobrarAlgoAhora: () => void
  /** Solo ubicacion: en que lugar de la grilla del encabezado va. */
  className?: string
}

/**
 * "Fiar todo" es la forma explicita de decir que el cliente no paga nada ahora. Un monto en $0 no sirve para eso:
 * un campo vacio y un cero se confunden, obliga a elegir un medio para cobrar cero, y un cero tipeado por error
 * dejaria la venta entera como deuda sin que el vendedor lo haya decidido.
 */
export function BotonFiarTodo({ fiarTodo, onFiarTodo, onCobrarAlgoAhora, className }: BotonFiarTodoProps) {
  return fiarTodo ? (
    <Button type="button" variant="outline" className={cn('bg-fondo-tarjeta', className)} onClick={onCobrarAlgoAhora}>
      <Wallet aria-hidden="true" />
      Cobrar algo ahora
    </Button>
  ) : (
    <Button type="button" variant="outline" className={cn('bg-fondo-tarjeta', className)} onClick={onFiarTodo}>
      <NotebookPen aria-hidden="true" />
      Fiar todo
    </Button>
  )
}
