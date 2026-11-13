import { AvisoVentanaModificacion } from '@/features/ventas/components/aviso-ventana-modificacion'
import type { FilaHistorial } from '@/features/ventas/types/historial'

/** Props del texto que avisa hasta cuando se puede editar o anular una venta. */
interface AvisoVentanaVentaProps {
  fila: FilaHistorial
  className?: string
}

export function AvisoVentanaVenta({ fila, className }: AvisoVentanaVentaProps) {
  return (
    <AvisoVentanaModificacion
      ventanaVigente={fila.ventanaVigente}
      fechaHoraLimiteModificacion={fila.fechaHoraLimiteModificacion}
      className={className}
    />
  )
}
