import type {
  CodigoMotivoAnulacionCambio,
  CodigoMotivoCambio,
  CodigoMotivoEdicionCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import type { OpcionSelectorMotivo } from '@/features/ventas/components/selector-motivo'

// Catalogos de motivos de la Demo: van fijos en el codigo porque no hay ABM. El back guarda el codigo
// y, solo con OTRO, un detalle escrito a mano. Las listas todavia no estan validadas con el negocio.

/** Una opcion tipada de la lista de motivos. */
export interface OpcionMotivoCambio<Codigo extends string> extends OpcionSelectorMotivo {
  codigo: Codigo
}

/** Motivos por los que un cliente cambia mercaderia. */
export const MOTIVOS_CAMBIO: OpcionMotivoCambio<CodigoMotivoCambio>[] = [
  { codigo: 'PRODUCTO_DEFECTUOSO', etiqueta: 'Producto defectuoso o en mal estado' },
  { codigo: 'NO_LE_GUSTO_A_LA_MASCOTA', etiqueta: 'No le gustó a la mascota' },
  { codigo: 'ERROR_EN_LA_ENTREGA', etiqueta: 'Se entregó otro producto por error' },
  { codigo: 'MEDIDA_INCORRECTA', etiqueta: 'Medida o tamaño incorrectos' },
  { codigo: 'OTRO', etiqueta: 'Otro' },
]

/** Motivos para anular un cambio (baja definitiva dentro de la ventana de 15 minutos). */
export const MOTIVOS_ANULACION_CAMBIO: OpcionMotivoCambio<CodigoMotivoAnulacionCambio>[] = [
  { codigo: 'CAMBIO_DUPLICADO', etiqueta: 'Cambio duplicado' },
  { codigo: 'ERROR_DE_CARGA', etiqueta: 'Error al cargar el cambio' },
  { codigo: 'CLIENTE_SE_ARREPINTIO', etiqueta: 'El cliente se arrepintió' },
  { codigo: 'DEVOLUCION_NO_CONCRETADA', etiqueta: 'El cliente no llegó a devolver el artículo' },
  { codigo: 'OTRO', etiqueta: 'Otro' },
]

/** Motivos para editar un cambio (que internamente lo anula y vuelve a cargar). */
export const MOTIVOS_EDICION_CAMBIO: OpcionMotivoCambio<CodigoMotivoEdicionCambio>[] = [
  { codigo: 'ARTICULO_DEVUELTO_INCORRECTO', etiqueta: 'Artículo devuelto incorrecto' },
  { codigo: 'ARTICULO_ENTREGADO_INCORRECTO', etiqueta: 'Artículo entregado incorrecto' },
  { codigo: 'CANTIDAD_O_PESO_INCORRECTOS', etiqueta: 'Cantidad o peso incorrectos' },
  { codigo: 'VENTA_VINCULADA_INCORRECTA', etiqueta: 'Venta vinculada incorrecta' },
  { codigo: 'MEDIO_DE_PAGO_INCORRECTO', etiqueta: 'Medio de pago incorrecto' },
  { codigo: 'OTRO', etiqueta: 'Otro' },
]

/** Etiqueta de cada codigo, para mostrar un motivo ya guardado. */
export const ETIQUETA_POR_MOTIVO_CAMBIO: Record<string, string> = Object.fromEntries(
  [...MOTIVOS_CAMBIO, ...MOTIVOS_ANULACION_CAMBIO, ...MOTIVOS_EDICION_CAMBIO].map(
    ({ codigo, etiqueta }) => [codigo, etiqueta],
  ),
)
