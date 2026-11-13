// Constantes de la maqueta de Cambios posventa. Temporal: desaparecen con la Integracion.

// --- COMPORTAMIENTOS FIJOS PARA PROBAR ---
/** Editar y anular siempre responden 403, aunque el contador diga que hay tiempo. */
export const ID_CAMBIO_RECHAZADO_POR_PLAZO = 2011
/** Anular responde 409: el stock que entro como granel ya se vendio y no se puede descontar. */
export const ID_CAMBIO_SIN_STOCK_PARA_REVERTIR = 2009
/** Confirmar un cambio vinculado a esta venta responde 409: no hay caja abierta. */
export const ID_VENTA_SIN_CAJA = 1044
/** Confirmar un cambio vinculado a esta venta responde 404: la venta no se encuentra. */
export const ID_VENTA_NO_ENCONTRADA = 1043
/** Entregar este producto responde 409: no hay stock. */
export const ID_PRODUCTO_SIN_STOCK = 7
/** Entregar este producto responde 400: el servidor rechaza los datos. */
export const ID_PRODUCTO_RECHAZADO = 6

// --- LATENCIAS Y TAMANOS ---
export const LATENCIA_ACCION_CAMBIO_MILISEGUNDOS = 700
export const LATENCIA_REGISTRO_CAMBIO_MILISEGUNDOS = 900
export const LATENCIA_DETALLE_CAMBIO_MILISEGUNDOS = 400
export const LATENCIA_BUSQUEDA_VENTA_MILISEGUNDOS = 500
/** Ventas por pagina en la busqueda del alta: pocas, porque se muestran en un modal. */
export const CANTIDAD_VENTAS_POR_PAGINA_BUSQUEDA = 5
/** Diferencia entre el reloj del servidor y el del dispositivo; en la integracion se calcula por consulta. */
export const DESFASE_RELOJ_SERVIDOR_CAMBIOS_MILISEGUNDOS = 0
/** Nombre del usuario de la sesion de prueba; en la integracion lo asigna el servidor desde el token. */
export const NOMBRE_USUARIO_CAMBIOS_EJEMPLO = 'Usuario de prueba'
