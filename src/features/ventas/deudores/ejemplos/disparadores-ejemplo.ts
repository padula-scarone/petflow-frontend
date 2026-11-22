// Disparadores de la maqueta: valores que provocan a proposito un estado dificil de ver de otro modo (409, 404, error,
// sin resultados). Sirven para mostrar cada estado en una demo; al integrar con el back se borran junto con los ejemplos.

/** Buscar esto en el buscador de deudor no devuelve a nadie. */
export const BUSQUEDA_SIN_RESULTADOS_EJEMPLO = 'zzz'

/** Buscar esto en el buscador de deudor falla como si no hubiera red. */
export const BUSQUEDA_CON_ERROR_EJEMPLO = 'error'

// Dar de alta un deudor con el DNI 20111222 devuelve 409: ya es de "Marta Gimenez" (id 1). No hace falta un
// disparador aparte: el almacen la tiene entre sus datos de ejemplo.

/** Confirmar una venta con este deudor devuelve 404: el deudor ya no existe. */
export const ID_DEUDOR_INEXISTENTE_AL_CONFIRMAR_EJEMPLO = 9

/** Cobrar este deudor devuelve 409 con un motivo distinto segun el fiado que se incluya. */
export const ID_DEUDOR_CON_CONFLICTOS_EJEMPLO = 8
export const ID_VENTA_FIADO_YA_NO_PENDIENTE_EJEMPLO = 9101
export const ID_VENTA_FIADO_MONTO_SUPERA_FALTANTE_EJEMPLO = 9102
export const ID_VENTA_FIADO_CAJA_CERRADA_EJEMPLO = 9103

/** Abrir la ficha de este deudor devuelve 404. */
export const ID_DEUDOR_NO_ENCONTRADO_EJEMPLO = 999

/** Abrir la ficha de este deudor falla como si no hubiera red. */
export const ID_DEUDOR_CON_ERROR_EJEMPLO = 500
