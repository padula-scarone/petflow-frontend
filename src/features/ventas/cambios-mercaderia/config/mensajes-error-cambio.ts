// Textos propios para el vendedor: claros y sin detalle tecnico. Los mensajes del back son para desarrolladores.
// Los textos de red, tiempo agotado y servidor caido son los de Ventas (config/mensajes-error-venta.ts).

// --- ERRORES DEL DETALLE ---
export const MENSAJE_CAMBIO_INEXISTENTE = 'El cambio ya no existe. Actualizá el listado.'
export const MENSAJE_DETALLE_CAMBIO_ILEGIBLE = 'No pudimos mostrar el cambio. Intentá de nuevo.'

// --- ERRORES DEL ALTA ---
export const MENSAJE_ALTA_CAMBIO_FALLIDA = 'No se pudo registrar el cambio. Intentá de nuevo.'
export const MENSAJE_ALTA_CAMBIO_DATOS_NO_COINCIDEN =
  'Algunos datos del cambio no coinciden. Volvé al paso anterior, revisalos e intentá de nuevo.'
export const MENSAJE_ALTA_CAMBIO_SALDO_NEGATIVO = 'Solo se puede cambiar por un producto de igual o mayor valor.'
export const MENSAJE_ALTA_CAMBIO_VENTA_INEXISTENTE = 'La venta vinculada ya no existe. Elegí otra.'
export const MENSAJE_ALTA_CAMBIO_VENTA_NO_VINCULABLE =
  'La venta ya no se puede vincular: se anuló o quedó pendiente de pago. Elegí otra.'
export const MENSAJE_ALTA_CAMBIO_CANTIDAD_EXCEDE_VENTA =
  'La cantidad supera lo que queda por devolver de esa venta. Corregila.'
export const MENSAJE_ALTA_CAMBIO_SIN_CAJA =
  'No hay una caja abierta, así que no se puede registrar el cambio. Abrí la caja y volvé a intentar.'
export const MENSAJE_ALTA_CAMBIO_SIN_STOCK =
  'No hay stock suficiente del artículo que se entrega. Elegí otro o bajá la cantidad.'
export const MENSAJE_ALTA_CAMBIO_ITEM_NO_DISPONIBLE =
  'Un producto o un medio de pago ya no está disponible. Volvé al paso anterior y revisalo.'
export const MENSAJE_ALTA_CAMBIO_INCIERTA =
  'No pudimos confirmar si el cambio se registró. No lo cargues de nuevo todavía: verificá si se guardó o revisá la lista de cambios.'
export const MENSAJE_ALTA_CAMBIO_SIN_VERIFICAR =
  'Todavía no podemos saber si el cambio se guardó. Revisá la lista de cambios antes de volver a confirmar: si no figura, recién ahí cargalo de nuevo.'
export const MENSAJE_ALTA_CAMBIO_NO_GUARDADO =
  'El cambio no se guardó. Podés confirmarlo de nuevo.'

// --- ERRORES DE ANULAR Y EDITAR ---
export const MENSAJE_PLAZO_VENCIDO_CAMBIO =
  'Pasaron más de 15 minutos: ya no se puede editar ni anular este cambio. Actualizá el listado.'
export const MENSAJE_ANULACION_CAMBIO_SIN_CAJA =
  'No se pudo anular: este cambio cobró un saldo y hace falta una caja abierta para revertirlo. Abrí la caja y volvé a intentar.'
export const MENSAJE_ANULACION_CAMBIO_STOCK_NO_REVERTIBLE =
  'No se pudo anular: el stock que entró con este cambio ya no alcanza para descontarlo (por ejemplo, el granel ya se vendió).'
export const MENSAJE_ANULACION_CAMBIO_FALLIDA = 'No se pudo anular el cambio. Intentá de nuevo.'
export const MENSAJE_ANULACION_CAMBIO_NO_APLICADA = 'El cambio no se anuló. Podés intentar de nuevo.'
export const MENSAJE_ANULACION_CAMBIO_INCIERTA =
  'No pudimos confirmar si el cambio se anuló. Actualizá el listado para ver su estado. Si seguís viéndolo vigente, podés intentar de nuevo: no se anulará dos veces.'
export const MENSAJE_EDICION_CAMBIO_NO_PREPARADA =
  'No pudimos preparar la edición y no se anuló nada. Intentá de nuevo.'

/** Texto cuando otra persona ya anulo el cambio que se queria anular. */
export function crearMensajeCambioYaAnulado(nombreUsuario: string | null) {
  return nombreUsuario === null
    ? 'El cambio ya estaba anulado. Actualizá el listado.'
    : `El cambio ya lo anuló ${nombreUsuario}. Actualizá el listado.`
}

// --- AVISOS AL REPOBLAR UNA EDICION ---
export const AVISO_VENTA_YA_NO_VINCULABLE =
  'La venta vinculada ya no se puede vincular (se anuló o quedó pendiente de pago): el cambio queda sin venta. Revisá los datos antes de confirmar.'
export const AVISO_VENTA_NO_DISPONIBLE =
  'No pudimos leer la venta vinculada: el cambio queda sin venta. Volvé a vincularla si corresponde.'

/** Aviso cuando un producto del cambio ya no esta activo o no tiene stock para volver a cargarlo. */
export function crearAvisoArticuloNoDisponible(rol: 'devuelto' | 'entregado', nombreProducto: string) {
  return `El artículo ${rol} (${nombreProducto}) ya no está disponible en el catálogo o no tiene stock. Elegilo de nuevo.`
}

/** Aviso cuando el cambio original no tenia motivo guardado (cambios anteriores a que se registrara). */
export const AVISO_MOTIVO_NO_REGISTRADO = 'El cambio original no tenía motivo guardado: elegí uno para confirmar.'
