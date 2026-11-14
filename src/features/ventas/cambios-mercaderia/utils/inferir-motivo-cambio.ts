import { MOTIVOS_CAMBIO } from '@/features/ventas/cambios-mercaderia/config/motivos-cambio'
import type { CodigoMotivoCambio } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { CODIGO_MOTIVO_OTRO, LONGITUD_MAXIMA_DETALLE_MOTIVO } from '@/features/ventas/config/motivos-venta'
import { normalizarTextoBusqueda } from '@/features/ventas/utils/normalizar-texto-busqueda'

/** Motivo para precargar el formulario: el codigo elegido y, solo con OTRO, lo escrito. */
export interface MotivoInferido {
  codigoMotivo: CodigoMotivoCambio | null
  detalleMotivo: string
}

/**
 * Convierte el texto con el que se guardo un cambio en la seleccion del formulario (al editarlo). Si coincide
 * con la etiqueta de un motivo de la lista usa ese codigo; si no, es "Otro" con el texto como detalle. "Otro" no
 * se compara con su etiqueta: un detalle escrito que diga "Otro" sigue siendo un detalle. Sin motivo guardado
 * (cambios viejos) no se elige ninguno.
 */
export function inferirMotivoCambio(motivoCambio: string | null): MotivoInferido {
  const texto = motivoCambio?.trim() ?? ''
  if (texto === '') return { codigoMotivo: null, detalleMotivo: '' }

  const textoNormalizado = normalizarTextoBusqueda(texto)
  const coincidencia = MOTIVOS_CAMBIO.find(
    (motivo) => motivo.codigo !== CODIGO_MOTIVO_OTRO && normalizarTextoBusqueda(motivo.etiqueta) === textoNormalizado,
  )
  if (coincidencia) return { codigoMotivo: coincidencia.codigo, detalleMotivo: '' }
  return { codigoMotivo: CODIGO_MOTIVO_OTRO, detalleMotivo: texto.slice(0, LONGITUD_MAXIMA_DETALLE_MOTIVO) }
}
