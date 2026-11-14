// Textos propios para el vendedor: claros y sin detalle tecnico. Los mensajes del back son para desarrolladores.

// --- ERRORES DE CONSULTA (CATALOGO, MEDIOS DE PAGO, DETALLE DE LA VENTA) ---
export const MENSAJE_SIN_RED = 'No hay conexión. Revisá tu internet e intentá de nuevo.'
export const MENSAJE_TIEMPO_AGOTADO = 'El servidor tardó demasiado en responder. Intentá de nuevo.'
export const MENSAJE_SERVIDOR_NO_DISPONIBLE =
  'El servidor no está disponible en este momento. Intentá de nuevo en un rato.'

/** Texto cuando el back responde 403: el usuario no tiene permiso para lo que pidio. */
export function crearMensajeSinPermiso(accion: string) {
  return `No tenés permiso para ${accion}.`
}

/** Texto de respaldo para cualquier otro error de una consulta. */
export function crearMensajeConsultaFallida(recurso: string) {
  return `No pudimos cargar ${recurso}. Intentá de nuevo.`
}

// --- ERRORES DEL ALTA DE VENTA ---
export const MENSAJE_RESULTADO_INCIERTO =
  'No la cobres de nuevo todavía: es posible que se haya registrado. Revisá en el Historial de ventas o consultá con el encargado si figura. Si no figura, cancelá esta venta y cargala otra vez.'
export const MENSAJE_DATOS_NO_COINCIDEN =
  'Algunos datos de la venta no coinciden. Volvé al carrito, revisá los productos y el cobro e intentá de nuevo.'
export const MENSAJE_ITEM_NO_DISPONIBLE =
  'Un producto o un medio de pago ya no está disponible. Volvé al carrito y revisalo.'
export const MENSAJE_SIN_CAJA_ABIERTA =
  'No hay una caja abierta, así que no se puede registrar el cobro. Podés registrar la venta como fiado.'
export const MENSAJE_ALTA_FALLIDA = 'No se pudo registrar la venta. Intentá de nuevo.'
export const MENSAJE_PRODUCTO_SIN_NOMBRE = 'uno de los productos'

/** Texto cuando el stock no alcanza para un producto del carrito. */
export function crearMensajeStockInsuficiente(nombreProducto: string) {
  return `No hay stock suficiente de ${nombreProducto}. Ajustá la cantidad o quitalo del carrito.`
}

// --- ERROR DEL DETALLE DE LA VENTA ---
export const MENSAJE_COMPROBANTE_ILEGIBLE = 'No pudimos mostrar el comprobante. Intentá de nuevo.'
