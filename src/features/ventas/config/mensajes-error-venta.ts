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

// --- ERRORES DEL HISTORIAL: DETALLE, ANULAR Y EDITAR ---
export const MENSAJE_VENTA_INEXISTENTE = 'La venta ya no existe. Actualizá el listado.'
export const MENSAJE_DETALLE_ILEGIBLE = 'No pudimos mostrar la venta. Intentá de nuevo.'
export const MENSAJE_PLAZO_VENCIDO =
  'Pasaron más de 15 minutos: ya no se puede editar ni anular esta venta. Actualizá el listado.'
export const MENSAJE_MOTIVO_INVALIDO = 'El motivo no es válido. Escribí entre 1 y 200 caracteres.'
export const MENSAJE_ANULACION_SIN_CAJA =
  'No se pudo anular. Revisá que haya una caja abierta (una venta cobrada la necesita) y que la venta no haya cambiado, y volvé a intentar.'
export const MENSAJE_ANULACION_FALLIDA = 'No se pudo anular la venta. Intentá de nuevo.'
export const MENSAJE_ANULACION_NO_APLICADA = 'La venta no se anuló. Podés intentar de nuevo.'
export const MENSAJE_ANULACION_INCIERTA =
  'No pudimos confirmar si la venta se anuló. Actualizá el listado para ver su estado. Si seguís viéndola vigente, podés intentar de nuevo: no se anulará dos veces.'
export const MENSAJE_EDICION_NO_PREPARADA =
  'No pudimos preparar la edición y no se anuló nada. Intentá de nuevo.'

/** Texto cuando otra persona ya anulo la venta que se queria anular. */
export function crearMensajeYaAnulada(nombreUsuario: string | null) {
  return nombreUsuario === null
    ? 'La venta ya estaba anulada. Actualizá el listado.'
    : `La venta ya la anuló ${nombreUsuario}. Actualizá el listado.`
}

// --- ERRORES DEL HISTORIAL: COBRO DE UN FIADO ---
export const MENSAJE_COBRO_DATOS_NO_COINCIDEN =
  'Los montos del cobro no coinciden con lo que se debe. Revisá los medios y los montos e intentá de nuevo.'
export const MENSAJE_COBRO_SIN_CAJA =
  'No hay una caja abierta, así que no se puede registrar el cobro. Abrí la caja y volvé a intentar.'
export const MENSAJE_COBRO_FALLIDO = 'No se pudo cobrar el fiado. Intentá de nuevo.'
export const MENSAJE_COBRO_NO_APLICADO = 'El fiado no se cobró. Podés intentar de nuevo.'
export const MENSAJE_COBRO_INCIERTO =
  'No pudimos confirmar si el fiado se cobró. Actualizá el listado para ver su estado. Si sigue pendiente, podés intentar de nuevo: no se cobrará dos veces.'
export const MENSAJE_FIADO_YA_NO_PENDIENTE =
  'Este fiado ya no está pendiente: otra persona lo cobró o lo anuló. Actualizá el listado.'
