// Textos propios para el vendedor: claros y sin detalle tecnico. Los mensajes del back son para desarrolladores.

/**
 * Motivo por el que no se puede confirmar el cobro cuando todavia no se eligio un medio de pago. Es evidente
 * con el boton bloqueado, asi que el pie de celular no lo repite; el resto de los motivos si se muestran.
 */
export const MOTIVO_ELEGIR_MEDIO_PAGO = 'Elegí un medio de pago'

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
  'No pudimos confirmar si la venta se registró. No la cargues de nuevo todavía: revisá en el Historial de ventas si figura. Si no figura, cargala otra vez.'
export const MENSAJE_DATOS_NO_COINCIDEN =
  'Algunos datos de la venta no coinciden. Volvé al carrito, revisá los productos y el cobro e intentá de nuevo.'
export const MENSAJE_DATOS_ENVIO_RECHAZADOS =
  'El servidor no aceptó los datos del envío. Corregí lo que se marca en rojo en Entrega e intentá de nuevo.'
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

// --- ERRORES DEL HISTORIAL: DETALLE Y ANULAR ---
export const MENSAJE_VENTA_INEXISTENTE = 'La venta ya no existe. Actualizá el listado.'
export const MENSAJE_DETALLE_ILEGIBLE = 'No pudimos mostrar la venta. Intentá de nuevo.'
export const MENSAJE_PLAZO_VENCIDO =
  'Pasaron más de 15 minutos: ya no se puede anular esta venta. Actualizá el listado.'
export const MENSAJE_MOTIVO_INVALIDO = 'El motivo no es válido. Escribí entre 1 y 200 caracteres.'
export const MENSAJE_ANULACION_SIN_CAJA =
  'No se pudo anular. Revisá que haya una caja abierta (una venta cobrada la necesita) y que la venta no haya cambiado, y volvé a intentar.'
export const MENSAJE_ANULACION_FALLIDA = 'No se pudo anular la venta. Intentá de nuevo.'
/** 409 FIADO_CON_COBROS: los cobros no se anulan, asi que un fiado que ya tiene uno no se puede anular. */
export const MENSAJE_ANULACION_FIADO_CON_COBROS =
  'Este fiado ya tiene cobros registrados, por eso no se puede anular. Revisá su cuenta en Deudores.'
export const MENSAJE_ANULACION_NO_APLICADA = 'La venta no se anuló. Podés intentar de nuevo.'
export const MENSAJE_ANULACION_INCIERTA =
  'No pudimos confirmar si la venta se anuló. Actualizá el listado para ver su estado. Si seguís viéndola vigente, podés intentar de nuevo: no se anulará dos veces.'

/** Texto cuando otra persona ya anulo la venta que se queria anular. */
export function crearMensajeYaAnulada(nombreUsuario: string | null) {
  return nombreUsuario === null
    ? 'La venta ya estaba anulada. Actualizá el listado.'
    : `La venta ya la anuló ${nombreUsuario}. Actualizá el listado.`
}
