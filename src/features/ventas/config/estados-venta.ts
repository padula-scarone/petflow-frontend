import { Ban, CircleCheck, Clock } from 'lucide-react'
import type { PresentacionEstado } from '@/features/ventas/types/compartidos'
import type { EstadoVentaHistorial } from '@/features/ventas/types/historial'

/** Como se presenta cada estado de venta: siempre icono y texto, nunca solo color. */
export type PresentacionEstadoVenta = PresentacionEstado

export const PRESENTACION_ESTADO_VENTA: Record<EstadoVentaHistorial, PresentacionEstadoVenta> = {
  COMPLETADA: {
    etiqueta: 'Completada',
    icono: CircleCheck,
    claseInsignia: 'text-green-700',
  },
  PENDIENTE_PAGO: {
    etiqueta: 'Pendiente de pago',
    icono: Clock,
    claseInsignia: 'text-amber-700',
  },
  // Gris y no rojo: el rojo queda para acciones destructivas
  ANULADA: {
    etiqueta: 'Anulada',
    icono: Ban,
    claseInsignia: 'bg-fondo-suave text-texto-suave',
  },
}
