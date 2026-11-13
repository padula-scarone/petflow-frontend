import type {
  CodigoMotivo,
  CodigoMotivoAnulacion,
  CodigoMotivoEdicion,
} from '@/features/ventas/types/historial'

// Catalogo de motivos de la Demo: va fijo en el codigo porque no hay ABM. El back guarda el codigo
// y, solo con OTRO, un detalle escrito a mano. Las listas todavia no estan validadas con el negocio.

/** Una opcion de la lista de motivos. */
export interface OpcionMotivo<Codigo extends CodigoMotivo> {
  codigo: Codigo
  etiqueta: string
}

/** Motivos para anular una venta (baja definitiva dentro de la ventana de 15 minutos). */
export const MOTIVOS_ANULACION: OpcionMotivo<CodigoMotivoAnulacion>[] = [
  { codigo: 'VENTA_DUPLICADA', etiqueta: 'Venta duplicada' },
  { codigo: 'PAGO_NO_CONCRETADO', etiqueta: 'Pago rechazado o no acreditado' },
  { codigo: 'CLIENTE_CANCELO', etiqueta: 'El cliente canceló la compra' },
  { codigo: 'PRODUCTO_NO_DISPONIBLE', etiqueta: 'Producto sin stock o en mal estado' },
  { codigo: 'ENVIO_NO_POSIBLE', etiqueta: 'No es posible realizar el envío' },
  { codigo: 'ERROR_DE_CARGA', etiqueta: 'Error al cargar la venta' },
  { codigo: 'OTRO', etiqueta: 'Otro' },
]

/** Motivos para editar una venta (que internamente la anula y la vuelve a cargar). */
export const MOTIVOS_EDICION: OpcionMotivo<CodigoMotivoEdicion>[] = [
  { codigo: 'PRODUCTO_O_CANTIDAD_INCORRECTOS', etiqueta: 'Producto o cantidad incorrectos' },
  { codigo: 'CLIENTE_CAMBIO_PEDIDO', etiqueta: 'El cliente cambió el pedido' },
  { codigo: 'MEDIO_DE_PAGO_INCORRECTO', etiqueta: 'Medio de pago incorrecto' },
  { codigo: 'DESCUENTO_O_PRECIO_INCORRECTO', etiqueta: 'Descuento o precio incorrecto' },
  { codigo: 'DATOS_DEL_CLIENTE_INCORRECTOS', etiqueta: 'Datos del cliente incorrectos' },
  { codigo: 'OTRO', etiqueta: 'Otro' },
]

/** Etiqueta de cada codigo, para mostrar un motivo ya guardado. */
export const ETIQUETA_POR_MOTIVO: Record<CodigoMotivo, string> = Object.fromEntries(
  [...MOTIVOS_ANULACION, ...MOTIVOS_EDICION].map(({ codigo, etiqueta }) => [codigo, etiqueta]),
) as Record<CodigoMotivo, string>

/** El unico motivo que pide escribir un detalle. */
export const CODIGO_MOTIVO_OTRO = 'OTRO' satisfies CodigoMotivo

/** Largo maximo del detalle de "Otro"; mismo limite que el motivo del descuento manual. */
export const LONGITUD_MAXIMA_DETALLE_MOTIVO = 200
