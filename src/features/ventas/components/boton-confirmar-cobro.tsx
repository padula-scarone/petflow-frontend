import { Check, NotebookPen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FormaPago } from '@/features/ventas/types/cobro'

/** Props del boton principal de la Seccion 2. */
interface BotonConfirmarCobroProps {
  formaPago: FormaPago
  habilitado: boolean
  /** true mientras la venta viaja al back: el boton queda deshabilitado y avisa que esta registrando. */
  enviando?: boolean
  onConfirmarCobro: () => void
  className?: string
}

export function BotonConfirmarCobro({
  formaPago,
  habilitado,
  enviando = false,
  onConfirmarCobro,
  className,
}: BotonConfirmarCobroProps) {
  const esFiado = formaPago === 'fiado'

  return (
    // Verde cuando entra dinero; morado en el fiado, que no impacta la caja
    <Button
      type="button"
      variant={esFiado ? 'default' : 'exito'}
      className={cn(
        'h-12 min-w-0 px-3 text-sm font-bold tracking-wide shadow-md sm:px-8 sm:text-base xl:h-14 xl:text-lg',
        className,
      )}
      disabled={!habilitado}
      onClick={onConfirmarCobro}
    >
      {enviando ? 'REGISTRANDO…' : esFiado ? 'REGISTRAR FIADO' : 'CONFIRMAR'}
      {/* En pantallas muy angostas el icono se oculta para que el texto entre completo */}
      {esFiado ? (
        <NotebookPen className="size-5 max-sm:hidden xl:size-6" />
      ) : (
        <Check className="size-5 xl:size-6" />
      )}
    </Button>
  )
}
