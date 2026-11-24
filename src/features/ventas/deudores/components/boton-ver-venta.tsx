import { ReceiptText } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { RUTA_HISTORIAL, type EstadoAbrirVentaHistorial } from '@/features/ventas/config/rutas-historial'

/** Props del boton que lleva al detalle de la venta de un fiado. */
interface BotonVerVentaProps {
  idVenta: number
  numeroComprobante: string
  className?: string
}

/**
 * Lleva al Historial con el detalle de la venta del fiado ya abierto. El detalle de una venta vive en el Historial:
 * la ficha no lo repite, asi no muestra de la venta solo algunos datos sueltos.
 */
export function BotonVerVenta({ idVenta, numeroComprobante, className }: BotonVerVentaProps) {
  return (
    <Button asChild variant="ghost" className={cn('px-3', className)}>
      <Link
        to={RUTA_HISTORIAL}
        state={{ idVentaAbierta: idVenta } satisfies EstadoAbrirVentaHistorial}
        aria-label={`Ver la venta del comprobante ${numeroComprobante}`}
      >
        <ReceiptText aria-hidden="true" />
        Ver venta
      </Link>
    </Button>
  )
}
