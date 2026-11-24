import { NotebookText } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { construirRutaFichaDeudor } from '@/features/ventas/deudores/config/rutas-deudores'
import type { FilaHistorial } from '@/features/ventas/types/historial'

/** Props del boton que lleva a la deuda de un fiado. */
interface BotonVerDeudaProps {
  fila: FilaHistorial
  className?: string
}

/**
 * Lleva a la ficha del deudor con este fiado ya tildado para cobrar. Existe solo en un fiado pendiente que tiene
 * deudor: uno viejo, con el cliente como texto libre, no tiene a donde ir. La ficha pide el fiado al servidor: solo
 * viaja su id (`?fiado=`).
 */
export function BotonVerDeuda({ fila, className }: BotonVerDeudaProps) {
  if (fila.estado !== 'PENDIENTE_PAGO' || !fila.deudor) return null

  return (
    <Button asChild variant="outline" className={cn('bg-fondo-tarjeta', className)}>
      <Link
        to={construirRutaFichaDeudor(fila.deudor.idDeudor, fila.idVenta)}
        aria-label={`Ver la deuda del comprobante ${fila.numeroComprobante}`}
      >
        <NotebookText aria-hidden="true" />
        Ver deuda
      </Link>
    </Button>
  )
}
