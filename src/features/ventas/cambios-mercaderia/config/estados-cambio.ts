import { Ban, CircleCheck } from 'lucide-react'
import type { EstadoCambio } from '@/features/ventas/cambios-mercaderia/types/cambio'
import type { PresentacionEstado } from '@/features/ventas/types/compartidos'

/** Como se presenta cada estado de un cambio: siempre icono y texto, nunca solo color. */
export const PRESENTACION_ESTADO_CAMBIO: Record<EstadoCambio, PresentacionEstado> = {
  ACTIVO: {
    etiqueta: 'Activo',
    icono: CircleCheck,
    claseInsignia: 'text-green-700',
  },
  // Gris y no rojo: el rojo queda para acciones destructivas
  ANULADO: {
    etiqueta: 'Anulado',
    icono: Ban,
    claseInsignia: 'bg-fondo-suave text-texto-suave',
  },
}
