// Limites que impone el back al registrar una venta (modulo ventas, ventas.schemas.ts). El front los valida
// antes de enviar para no depender de un 400.

/** Largo maximo del motivo del descuento manual, sin contar los espacios de los extremos. */
export const MOTIVO_DESCUENTO_LONGITUD_MAXIMA = 200

/** Largo maximo del nombre del cliente de un fiado, sin contar los espacios de los extremos. */
export const CLIENTE_REFERENCIA_LONGITUD_MAXIMA = 100

/** Tope del monto recibido ("Paga con"): 9.999.999.999,99 en centavos. */
export const MONTO_RECIBIDO_MAXIMO_CENTAVOS = 999_999_999_999

/** Texto de respaldo para un descuento sin motivo guardado (solo ventas anteriores a que el motivo fuera obligatorio). */
export const MOTIVO_DESCUENTO_NO_REGISTRADO = 'Sin motivo registrado'

/** Cantidad maxima de coincidencias en el desplegable del buscador: mantiene liviana la lista. */
export const CANTIDAD_MAXIMA_RESULTADOS_BUSQUEDA = 20

/**
 * Tiempo que espera el cliente HTTP antes de cortar un pedido (ver cliente-http.ts). La barra de progreso
 * del envio se llena hasta este valor.
 */
export const TIEMPO_LIMITE_ENVIO_SEGUNDOS = 30

/** Segundos a partir de los cuales el envio se considera lento y se le pide al vendedor que no toque nada. */
export const SEGUNDOS_ENVIO_LENTO = 10
