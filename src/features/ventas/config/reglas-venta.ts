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

/** Peso minimo de un producto a granel, en gramos: el limite tecnico del back (1 g = 0,001 kg). El negocio puede definir uno mayor. */
export const CANTIDAD_MINIMA_GRANEL_GRAMOS = 1

/** Cuanto suman o restan los botones + y - de un producto a granel, en gramos. */
export const PASO_GRANEL_GRAMOS = 100

/** Peso con el que entra al carrito un producto a granel, en gramos (1 kg). */
export const CANTIDAD_INICIAL_GRANEL_GRAMOS = 1000

/** Cantidad maxima de coincidencias en el desplegable del buscador: mantiene liviana la lista. */
export const CANTIDAD_MAXIMA_RESULTADOS_BUSQUEDA = 20

/**
 * Tiempo que espera el cliente HTTP antes de cortar un pedido (ver cliente-http.ts). La barra de progreso
 * del envio se llena hasta este valor.
 */
export const TIEMPO_LIMITE_ENVIO_SEGUNDOS = 30

/** Segundos a partir de los cuales el envio se considera lento y se le pide al vendedor que no toque nada. */
export const SEGUNDOS_ENVIO_LENTO = 10

/** Texto que se muestra cuando una venta anterior a los comprobantes no tiene numero (el back lo manda null). */
export const NUMERO_COMPROBANTE_AUSENTE = 'Sin número'

// --- HISTORIAL ---

/** Ventas por pagina del historial: el valor por defecto del back (maximo 100). */
export const CANTIDAD_POR_PAGINA_HISTORIAL = 20

/** Largo maximo de la busqueda por cliente; mas que eso el back responde 400. */
export const TEXTO_CLIENTE_LONGITUD_MAXIMA = 100

/** Largo maximo de la busqueda por numero de comprobante; mas que eso el back responde 400. */
export const NUMERO_COMPROBANTE_LONGITUD_MAXIMA = 30

/**
 * Margen, en milisegundos, con el que se compara la hora de una anulacion o un cobro contra el momento del
 * envio al verificar un resultado incierto: absorbe el error al estimar el reloj del servidor.
 */
export const MARGEN_VERIFICACION_MILISEGUNDOS = 60_000
