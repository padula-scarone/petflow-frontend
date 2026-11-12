import { HandCoins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FilaHistorial } from '@/features/ventas/types/historial'

/** Props del boton que cobra un fiado. */
interface BotonCobrarFiadoProps {
  fila: FilaHistorial
  onCobrarFiado: (idVenta: number) => void
  className?: string
}

/** Solo existe en las ventas Pendientes de pago; el cobro de un fiado no tiene limite de tiempo. */
export function BotonCobrarFiado({ fila, onCobrarFiado, className }: BotonCobrarFiadoProps) {
  if (!fila.puedeCobrarFiado) return null

  return (
    <Button
      type="button"
      variant="exito"
      aria-label={`Cobrar el fiado del comprobante ${fila.numeroComprobante}`}
      className={cn('h-11 gap-1.5 px-4', className)}
      onClick={() => onCobrarFiado(fila.idVenta)}
    >
      <HandCoins />
      Cobrar
    </Button>
  )
}
