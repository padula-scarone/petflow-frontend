import { CODIGO_MOTIVO_OTRO, LONGITUD_MAXIMA_DETALLE_MOTIVO } from '@/features/ventas/config/motivos-venta'
import { normalizarTextoBusqueda } from '@/features/ventas/utils/normalizar-texto-busqueda'

/** Motivo para precargar un formulario: el codigo elegido y, solo con OTRO, lo escrito. */
export interface MotivoInferido<Codigo extends string> {
  codigoMotivo: Codigo | null
  detalleMotivo: string
}

/**
 * Convierte el texto con el que se guardo un motivo en la seleccion del formulario (al editar). Si coincide con
 * la etiqueta de una opcion de la lista usa ese codigo; si no, es "Otro" con el texto como detalle. "Otro" no se
 * compara con su etiqueta: un detalle escrito que diga "Otro" sigue siendo un detalle. Sin motivo guardado
 * (registros viejos) no se elige ninguno.
 */
export function inferirMotivoDeLista<Codigo extends string>(
  motivoGuardado: string | null,
  opciones: { codigo: Codigo; etiqueta: string }[],
): MotivoInferido<Codigo> {
  const texto = motivoGuardado?.trim() ?? ''
  if (texto === '') return { codigoMotivo: null, detalleMotivo: '' }

  const textoNormalizado = normalizarTextoBusqueda(texto)
  const coincidencia = opciones.find(
    (opcion) => opcion.codigo !== CODIGO_MOTIVO_OTRO && normalizarTextoBusqueda(opcion.etiqueta) === textoNormalizado,
  )
  if (coincidencia) return { codigoMotivo: coincidencia.codigo, detalleMotivo: '' }
  return {
    codigoMotivo: CODIGO_MOTIVO_OTRO as Codigo,
    detalleMotivo: texto.slice(0, LONGITUD_MAXIMA_DETALLE_MOTIVO),
  }
}
