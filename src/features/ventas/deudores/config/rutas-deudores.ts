import { ID_MODULO_VENTAS } from '@/features/ventas/config/rutas-registrar-venta'

/** Id de Deudores en MODULOS_MENU; la ruta se deriva de el. */
export const ID_SECCION_DEUDORES = 'deudores'

/** Ruta absoluta de la lista de Deudores. */
export const RUTA_DEUDORES = `/${ID_MODULO_VENTAS}/${ID_SECCION_DEUDORES}`

/** Nombre del parametro de la ficha que trae el fiado ya tildado ("Ver deuda" del Historial). */
export const PARAMETRO_FIADO_RESALTADO = 'fiado'

/** Ruta absoluta de la ficha de un deudor; con `idVentaFiado` abre con ese fiado ya tildado. */
export function construirRutaFichaDeudor(idDeudor: number, idVentaFiado?: number) {
  const ruta = `${RUTA_DEUDORES}/${idDeudor}`
  return idVentaFiado === undefined ? ruta : `${ruta}?${PARAMETRO_FIADO_RESALTADO}=${idVentaFiado}`
}

/** Segmento de la pantalla de cobro, hija de la ficha: comparte con ella los fiados tildados. */
export const SEGMENTO_COBRO_DEUDOR = 'cobro'

/** Ruta absoluta de la pantalla de cobro de un deudor. */
export function construirRutaCobroDeudor(idDeudor: number) {
  return `${RUTA_DEUDORES}/${idDeudor}/${SEGMENTO_COBRO_DEUDOR}`
}
