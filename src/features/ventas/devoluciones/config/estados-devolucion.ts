import { Ban, CircleCheck } from 'lucide-react'
import type { EstadoDevolucion } from '@/features/ventas/devoluciones/types/devolucion'
import type { PresentacionEstado } from '@/features/ventas/types/compartidos'

/** Como se presenta cada estado de una devolución: siempre icono y texto, nunca solo color. */
export const PRESENTACION_ESTADO_DEVOLUCION: Record<EstadoDevolucion, PresentacionEstado> = {
  ACTIVO: {
    etiqueta: 'Activa',
    icono: CircleCheck,
    claseInsignia: 'text-green-700',
  },
  // Rojo y no gris: el gris se lee como algo neutral y una devolución anulada no lo es
  ANULADO: {
    etiqueta: 'Anulada',
    icono: Ban,
    claseInsignia: 'text-red-700',
  },
}
