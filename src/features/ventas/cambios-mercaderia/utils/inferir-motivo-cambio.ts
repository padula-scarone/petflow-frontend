import { MOTIVOS_CAMBIO } from '@/features/ventas/cambios-mercaderia/config/motivos-cambio'
import type { CodigoMotivoCambio } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { inferirMotivoDeLista, type MotivoInferido as MotivoInferidoGenerico } from '@/features/ventas/utils/inferir-motivo'

/** Motivo para precargar el formulario: el codigo elegido y, solo con OTRO, lo escrito. */
export type MotivoInferido = MotivoInferidoGenerico<CodigoMotivoCambio>

/**
 * Convierte el texto con el que se guardo un cambio en la seleccion del formulario (al editarlo), contra la
 * lista de motivos de cambio. Ver `inferirMotivoDeLista` para la regla.
 */
export function inferirMotivoCambio(motivoCambio: string | null): MotivoInferido {
  return inferirMotivoDeLista(motivoCambio, MOTIVOS_CAMBIO)
}
