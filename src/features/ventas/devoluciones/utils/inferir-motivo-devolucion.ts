import { MOTIVOS_DEVOLUCION } from '@/features/ventas/devoluciones/config/motivos-devolucion'
import type { CodigoMotivoDevolucion } from '@/features/ventas/devoluciones/types/devolucion'
import { inferirMotivoDeLista, type MotivoInferido as MotivoInferidoGenerico } from '@/features/ventas/utils/inferir-motivo'

/** Motivo para precargar el formulario: el codigo elegido y, solo con OTRO, lo escrito. */
export type MotivoInferido = MotivoInferidoGenerico<CodigoMotivoDevolucion>

/**
 * Convierte el texto con el que se guardo una devolución en la seleccion del formulario (al editarla), contra la
 * lista de motivos de devolución. Ver `inferirMotivoDeLista` para la regla.
 */
export function inferirMotivoDevolucion(motivoDevolucion: string | null): MotivoInferido {
  return inferirMotivoDeLista(motivoDevolucion, MOTIVOS_DEVOLUCION)
}
