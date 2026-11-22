// Banderas de la maqueta de Deudores y fiados con pago parcial. Mientras el back no tenga estos endpoints, todo lo
// que dependa de ellos se simula en memoria; al integrar se apagan estas banderas y se borran los archivos de ejemplo.

/**
 * Registrar Venta usa el cobro con deuda (sin "Fiado" como forma de pago, con deudor y fecha estimada).
 * Apagada, vuelve a verse el cobro actual sin cambios.
 */
export const COBRO_CON_DEUDA_ACTIVO = true

/**
 * El Historial conserva el boton "Cobrar" que liquida un fiado de una vez contra el back real. Apagada, el boton
 * se reemplaza por "Ver deuda". El cobro real queda detras de esta bandera, sin borrarse.
 */
export const COBRO_FIADO_LEGADO_ACTIVO = false

/** Las filas pendientes del Historial reciben un deudor de ejemplo, para que "Ver deuda" tenga a donde ir. */
export const DECORAR_HISTORIAL_CON_DEUDORES_EJEMPLO = true
