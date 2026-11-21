// Textos propios para el vendedor: claros y sin detalle tecnico. Los mensajes del back son para desarrolladores.
// Los textos de red, tiempo agotado y servidor caido son los de Ventas (config/mensajes-error-venta.ts).

// --- ERRORES DEL DETALLE ---
export const MENSAJE_DEVOLUCION_INEXISTENTE = 'La devolución ya no existe. Actualizá el listado.'
export const MENSAJE_DETALLE_DEVOLUCION_ILEGIBLE = 'No pudimos mostrar la devolución. Intentá de nuevo.'

// --- ERRORES DEL ALTA ---
export const MENSAJE_ALTA_DEVOLUCION_FALLIDA = 'No se pudo registrar la devolución. Intentá de nuevo.'
export const MENSAJE_ALTA_DEVOLUCION_DATOS_NO_COINCIDEN =
  'Algunos datos de la devolución no coinciden. Volvé al paso anterior, revisalos e intentá de nuevo.'
export const MENSAJE_ALTA_DEVOLUCION_SALDO_NEGATIVO = 'Solo se puede cambiar por un producto de igual o mayor valor.'
export const MENSAJE_ALTA_DEVOLUCION_VENTA_INEXISTENTE = 'La venta vinculada ya no existe. Elegí otra.'
export const MENSAJE_ALTA_DEVOLUCION_VENTA_NO_VINCULABLE =
  'La venta ya no se puede vincular: se anuló o quedó pendiente de pago. Elegí otra.'
export const MENSAJE_ALTA_DEVOLUCION_CANTIDAD_EXCEDE_VENTA =
  'La cantidad supera lo que queda por devolver de esa venta. Corregila.'
export const MENSAJE_ALTA_DEVOLUCION_SIN_CAJA =
  'No hay una caja abierta, así que no se puede registrar la devolución. Abrí la caja y volvé a intentar.'
export const MENSAJE_ALTA_DEVOLUCION_SIN_STOCK =
  'No hay stock suficiente del artículo que se entrega. Elegí otro o bajá la cantidad.'
export const MENSAJE_ALTA_DEVOLUCION_ITEM_NO_DISPONIBLE =
  'Un producto o un medio de pago ya no está disponible. Volvé al paso anterior y revisalo.'
export const MENSAJE_ALTA_DEVOLUCION_INCIERTA =
  'No pudimos confirmar si la devolución se registró. No la cargues de nuevo todavía: verificá si se guardó o revisá la lista de devoluciones.'
export const MENSAJE_ALTA_DEVOLUCION_SIN_VERIFICAR =
  'Todavía no podemos saber si la devolución se guardó. Revisá la lista de devoluciones antes de volver a confirmar: si no figura, recién ahí cargala de nuevo.'
export const MENSAJE_ALTA_DEVOLUCION_NO_GUARDADA =
  'La devolución no se guardó. Podés confirmarla de nuevo.'

// --- ERRORES DE ANULAR Y EDITAR ---
export const MENSAJE_PLAZO_VENCIDO_DEVOLUCION =
  'Pasaron más de 15 minutos: ya no se puede editar ni anular esta devolución. Actualizá el listado.'
export const MENSAJE_ANULACION_DEVOLUCION_SIN_CAJA =
  'No se pudo anular: esta devolución cobró un saldo y hace falta una caja abierta para revertirlo. Abrí la caja y volvé a intentar.'
export const MENSAJE_ANULACION_DEVOLUCION_STOCK_NO_REVERTIBLE =
  'No se pudo anular: el stock que entró con esta devolución ya no alcanza para descontarlo (por ejemplo, el granel ya se vendió).'
export const MENSAJE_ANULACION_DEVOLUCION_FALLIDA = 'No se pudo anular la devolución. Intentá de nuevo.'
export const MENSAJE_ANULACION_DEVOLUCION_NO_APLICADA = 'La devolución no se anuló. Podés intentar de nuevo.'
export const MENSAJE_ANULACION_DEVOLUCION_INCIERTA =
  'No pudimos confirmar si la devolución se anuló. Actualizá el listado para ver su estado. Si seguís viéndola vigente, podés intentar de nuevo: no se anulará dos veces.'
export const MENSAJE_EDICION_DEVOLUCION_NO_PREPARADA =
  'No pudimos preparar la edición y no se anuló nada. Intentá de nuevo.'

/** Texto cuando otra persona ya anulo la devolución que se queria anular. */
export function crearMensajeDevolucionYaAnulada(nombreUsuario: string | null) {
  return nombreUsuario === null
    ? 'La devolución ya estaba anulada. Actualizá el listado.'
    : `La devolución ya la anuló ${nombreUsuario}. Actualizá el listado.`
}

// --- AVISOS AL REPOBLAR UNA EDICION ---
export const AVISO_VENTA_YA_NO_VINCULABLE =
  'La venta vinculada ya no se puede vincular (se anuló o quedó pendiente de pago): la devolución queda sin venta. Revisá los datos antes de confirmar.'
export const AVISO_VENTA_NO_DISPONIBLE =
  'No pudimos leer la venta vinculada: la devolución queda sin venta. Volvé a vincularla si corresponde.'

/** Aviso cuando un producto de la devolución ya no esta activo o no tiene stock para volver a cargarlo. */
export function crearAvisoArticuloNoDisponible(rol: 'devuelto' | 'entregado', nombreProducto: string) {
  return `El artículo ${rol} (${nombreProducto}) ya no está disponible en el catálogo o no tiene stock. Elegilo de nuevo.`
}

/** Aviso cuando la devolución original no tenia motivo guardado (devoluciones anteriores a que se registrara). */
export const AVISO_MOTIVO_NO_REGISTRADO = 'La devolución original no tenía motivo guardado: elegí uno para confirmar.'
