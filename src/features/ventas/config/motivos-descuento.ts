import type { CodigoMotivoDescuento } from '@/features/ventas/types/cobro'
import type { OpcionSelectorMotivo } from '@/features/ventas/components/selector-motivo'

// Catalogo de motivos del descuento manual: va fijo en el codigo porque no hay ABM. El back guarda el texto
// (la etiqueta elegida o, con OTRO, el detalle escrito). La lista todavia no esta validada con el negocio.

/** Una opcion tipada de la lista de motivos del descuento. */
export interface OpcionMotivoDescuento extends OpcionSelectorMotivo {
  codigo: CodigoMotivoDescuento
}

/** Motivos por los que se aplica un descuento manual a una venta. */
export const MOTIVOS_DESCUENTO: OpcionMotivoDescuento[] = [
  { codigo: 'CLIENTE_FRECUENTE', etiqueta: 'Cliente frecuente' },
  { codigo: 'PROMOCION_VIGENTE', etiqueta: 'Promoción o campaña vigente' },
  { codigo: 'COMPRA_POR_VOLUMEN', etiqueta: 'Compra por volumen' },
  { codigo: 'PRODUCTO_DANADO_O_POR_VENCER', etiqueta: 'Producto con envase dañado o próximo a vencer' },
  { codigo: 'COMPENSACION_POR_RECLAMO', etiqueta: 'Compensación por reclamo' },
  { codigo: 'EMPLEADO_O_CONOCIDO', etiqueta: 'Descuento a empleado o conocido' },
  { codigo: 'OTRO', etiqueta: 'Otro' },
]

/** Etiqueta de cada codigo, para armar el texto del motivo que se envia al back. */
export const ETIQUETA_POR_MOTIVO_DESCUENTO: Record<string, string> = Object.fromEntries(
  MOTIVOS_DESCUENTO.map(({ codigo, etiqueta }) => [codigo, etiqueta]),
)
