import type { CodigoMotivo, CodigoMotivoAnulacion } from '@/features/ventas/types/historial'

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

/** Etiqueta de cada codigo, para mostrar un motivo ya guardado. */
export const ETIQUETA_POR_MOTIVO: Record<CodigoMotivo, string> = Object.fromEntries(
  MOTIVOS_ANULACION.map(({ codigo, etiqueta }) => [codigo, etiqueta]),
) as Record<CodigoMotivo, string>

/** El unico motivo que pide escribir un detalle. */
export const CODIGO_MOTIVO_OTRO = 'OTRO' satisfies CodigoMotivo

/** Largo maximo del detalle de "Otro"; mismo limite que el motivo del descuento manual. */
export const LONGITUD_MAXIMA_DETALLE_MOTIVO = 200
