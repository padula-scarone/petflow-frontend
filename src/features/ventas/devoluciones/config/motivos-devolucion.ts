import type {
  CodigoMotivoAnulacionDevolucion,
  CodigoMotivoDevolucion,
  CodigoMotivoEdicionDevolucion,
} from '@/features/ventas/devoluciones/types/devolucion'
import type { OpcionSelectorMotivo } from '@/features/ventas/components/selector-motivo'

// Catalogos de motivos de la Demo: van fijos en el codigo porque no hay ABM. El back guarda el codigo
// y, solo con OTRO, un detalle escrito a mano. Las listas todavia no estan validadas con el negocio.

/** Una opcion tipada de la lista de motivos. */
export interface OpcionMotivoDevolucion<Codigo extends string> extends OpcionSelectorMotivo {
  codigo: Codigo
}

/** Motivos por los que un cliente hace una devolución. */
export const MOTIVOS_DEVOLUCION: OpcionMotivoDevolucion<CodigoMotivoDevolucion>[] = [
  { codigo: 'PRODUCTO_DEFECTUOSO', etiqueta: 'Producto defectuoso o en mal estado' },
  { codigo: 'NO_LE_GUSTO_A_LA_MASCOTA', etiqueta: 'No le gustó a la mascota' },
  { codigo: 'ERROR_EN_LA_ENTREGA', etiqueta: 'Se entregó otro producto por error' },
  { codigo: 'MEDIDA_INCORRECTA', etiqueta: 'Medida o tamaño incorrectos' },
  { codigo: 'OTRO', etiqueta: 'Otro' },
]

/** Motivos para anular una devolución (baja definitiva dentro de la ventana de 15 minutos). */
export const MOTIVOS_ANULACION_DEVOLUCION: OpcionMotivoDevolucion<CodigoMotivoAnulacionDevolucion>[] = [
  { codigo: 'DEVOLUCION_DUPLICADO', etiqueta: 'Devolución duplicada' },
  { codigo: 'ERROR_DE_CARGA', etiqueta: 'Error al cargar la devolución' },
  { codigo: 'CLIENTE_SE_ARREPINTIO', etiqueta: 'El cliente se arrepintió' },
  { codigo: 'DEVOLUCION_NO_CONCRETADA', etiqueta: 'El cliente no llegó a devolver el artículo' },
  { codigo: 'OTRO', etiqueta: 'Otro' },
]

/** Motivos para editar una devolución (que internamente la anula y vuelve a cargar). */
export const MOTIVOS_EDICION_DEVOLUCION: OpcionMotivoDevolucion<CodigoMotivoEdicionDevolucion>[] = [
  { codigo: 'ARTICULO_DEVUELTO_INCORRECTO', etiqueta: 'Artículo devuelto incorrecto' },
  { codigo: 'ARTICULO_ENTREGADO_INCORRECTO', etiqueta: 'Artículo entregado incorrecto' },
  { codigo: 'CANTIDAD_O_PESO_INCORRECTOS', etiqueta: 'Cantidad o peso incorrectos' },
  { codigo: 'VENTA_VINCULADA_INCORRECTA', etiqueta: 'Venta vinculada incorrecta' },
  { codigo: 'MEDIO_DE_PAGO_INCORRECTO', etiqueta: 'Medio de pago incorrecto' },
  { codigo: 'OTRO', etiqueta: 'Otro' },
]

/** Etiqueta de cada codigo, para mostrar un motivo ya guardado. */
export const ETIQUETA_POR_MOTIVO_DEVOLUCION: Record<string, string> = Object.fromEntries(
  [...MOTIVOS_DEVOLUCION, ...MOTIVOS_ANULACION_DEVOLUCION, ...MOTIVOS_EDICION_DEVOLUCION].map(
    ({ codigo, etiqueta }) => [codigo, etiqueta],
  ),
)
