import { NotebookText } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { construirRutaFichaDeudor } from '@/features/ventas/deudores/config/rutas-deudores'
import type { FiadoOrigenHistorial } from '@/features/ventas/deudores/types/cuenta-corriente'
import { CLAVE_FIADO_ORIGEN_HISTORIAL } from '@/features/ventas/deudores/utils/leer-fiado-origen-historial'
import type { FilaHistorial } from '@/features/ventas/types/historial'

/** Props del boton que lleva a la deuda de un fiado. */
interface BotonVerDeudaProps {
  fila: FilaHistorial
  className?: string
}

/**
 * Lleva a la ficha del deudor con este fiado ya tildado para cobrar. Existe solo en un fiado pendiente que tiene
 * deudor: uno viejo, con el cliente como texto libre, no tiene a donde ir.
 */
export function BotonVerDeuda({ fila, className }: BotonVerDeudaProps) {
  if (fila.estado !== 'PENDIENTE_PAGO' || !fila.deudor) return null

  // La ficha muestra este mismo fiado: en la maqueta viaja en el estado del router, con el back real lo pide al servidor
  const fiadoOrigen: FiadoOrigenHistorial = {
    idVenta: fila.idVenta,
    numeroComprobante: fila.numeroComprobante,
    fechaHora: fila.fechaHora,
    importeAdeudado: fila.montoTotal,
    montoPagado: Math.max(fila.montoTotal - (fila.montoFaltante ?? fila.montoTotal), 0),
    fechaEstimadaPago: fila.fechaEstimadaPago ?? null,
  }

  return (
    <Button asChild variant="outline" className={cn('bg-fondo-tarjeta', className)}>
      <Link
        to={construirRutaFichaDeudor(fila.deudor.idDeudor, fila.idVenta)}
        state={{ [CLAVE_FIADO_ORIGEN_HISTORIAL]: fiadoOrigen }}
        aria-label={`Ver la deuda del comprobante ${fila.numeroComprobante}`}
      >
        <NotebookText aria-hidden="true" />
        Ver deuda
      </Link>
    </Button>
  )
}
