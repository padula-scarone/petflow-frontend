import { ID_MODULO_VENTAS } from '@/features/ventas/config/rutas-registrar-venta'

/** Id de Historial en MODULOS_MENU; la ruta se deriva de el. */
export const ID_SECCION_HISTORIAL = 'historial'

/** Ruta absoluta del Historial de ventas. */
export const RUTA_HISTORIAL = `/${ID_MODULO_VENTAS}/${ID_SECCION_HISTORIAL}`

/** `location.state` con el que otra pantalla (por ejemplo "Ver venta" en la ficha de un deudor) abre el Historial. */
export interface EstadoAbrirVentaHistorial {
  /** Venta cuyo detalle se abre apenas entra el Historial. */
  idVentaAbierta: number
}

/** Lee del `location.state` del Historial la venta que hay que abrir; null si se entro de forma normal. */
export function leerIdVentaInicialHistorial(estado: unknown): number | null {
  const idVenta = (estado as Partial<EstadoAbrirVentaHistorial> | null)?.idVentaAbierta
  return typeof idVenta === 'number' && Number.isInteger(idVenta) && idVenta > 0 ? idVenta : null
}
