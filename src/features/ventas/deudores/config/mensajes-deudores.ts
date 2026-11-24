// Textos propios de Deudores. Los del back son para desarrolladores y no se muestran. Ninguno incluye el nombre, el DNI
// ni el telefono de un deudor (RNF-VENTAS-03).

/** Mensaje para cuando el guardado de un deudor falla sin una respuesta clara del back. */
export const MENSAJE_GUARDADO_DEUDOR_FALLIDO = 'No pudimos guardar el deudor. Revisá los datos e intentá de nuevo.'

/** Mensaje para cuando la busqueda de deudores falla. */
export const MENSAJE_BUSQUEDA_DEUDORES_FALLIDA = 'No pudimos buscar deudores. Revisá tu conexión e intentá de nuevo.'

/** Error del campo "Cobrar ahora" cuando queda vacio o en cero. */
export const MOTIVO_MONTO_AHORA_VACIO = 'Ingresá un monto mayor a cero'

/** Para cuando el back marca un campo del deudor como invalido aunque el formulario lo haya dado por bueno. */
export const MENSAJES_CAMPO_DEUDOR_INVALIDO = {
  nombreCompleto: 'Revisá el nombre y apellido',
  telefono: 'Revisá el teléfono',
  dni: 'Revisá el DNI',
} as const

export const MENSAJE_SIN_PERMISO_GUARDAR_DEUDOR = 'No tenés permiso para guardar deudores.'
export const MENSAJE_DEUDOR_NO_ENCONTRADO = 'El deudor ya no existe. Volvé a la lista de Deudores.'

// --- COBRO DE FIADOS ---

export const MENSAJE_COBRO_FIADO_CAMBIO = 'Un fiado cambió mientras cobrabas. No se cobró nada: revisá la cuenta del deudor.'
export const MENSAJE_COBRO_MONTO_EXCEDE = 'El monto de un fiado supera lo que falta. No se cobró nada: revisá la cuenta del deudor.'
export const MENSAJE_COBRO_SIN_CAJA = 'No hay una caja abierta. No se cobró nada: abrí la caja y volvé a confirmar.'
export const MENSAJE_COBRO_SIMULTANEO = 'Otro cobro está procesando estos fiados. No se cobró nada: esperá unos segundos y reintentá.'
export const MENSAJE_COBRO_DATOS_INVALIDOS = 'Los montos o los medios de pago no son válidos. No se cobró nada: revisalos e intentá de nuevo.'
export const MENSAJE_COBRO_MEDIO_NO_DISPONIBLE = 'Un medio de pago ya no está disponible. No se cobró nada: elegí otro e intentá de nuevo.'
export const MENSAJE_COBRO_SIN_PERMISO = 'No tenés permiso para cobrar fiados.'
export const MENSAJE_COBRO_DEUDOR_NO_ENCONTRADO = 'El deudor ya no existe. No se cobró nada.'
export const MENSAJE_COBRO_FALLIDO = 'No pudimos registrar el cobro. No se cobró nada: intentá de nuevo.'
export const MENSAJE_COBRO_INCIERTO =
  'No pudimos confirmar si el cobro se registró. Antes de cobrar de nuevo, revisá la cuenta del deudor para no cobrar dos veces.'
export const MENSAJE_COBRO_APLICADO_SIN_RECIBO =
  'El cobro se registró, pero no pudimos cargar el recibo. Revisá la cuenta del deudor.'

// --- VENTA CON DEUDA (DOS PASOS: EL FIADO Y, SI HAY, EL PAGO INICIAL) ---

export const MENSAJE_DEUDOR_INEXISTENTE = 'El deudor ya no existe. Elegí a otra persona para registrar la venta.'
export const MENSAJE_FECHA_ESTIMADA_ANTERIOR = 'La fecha estimada de pago no puede ser anterior a hoy. Elegí otra fecha.'
export const MENSAJE_FIADO_NO_REGISTRADO = 'No pudimos registrar la venta. No se guardó nada: intentá de nuevo.'
export const MENSAJE_SIN_PERMISO_REGISTRAR_FIADO = 'No tenés permiso para registrar ventas.'
export const MENSAJE_FIADO_NO_ENCONTRADO_TRAS_FALLO =
  'No pudimos confirmar el registro y no encontramos ninguna venta nueva. Podés intentar de nuevo.'
export const MENSAJE_FIADO_INCIERTO =
  'No pudimos confirmar si la venta se registró. No la cargues de nuevo todavía: revisá en el Historial de ventas si figura.'

export const MENSAJE_PAGO_INICIAL_NO_REGISTRADO =
  'La venta ya quedó registrada como deuda total, pero el pago inicial no se registró.'
export const MENSAJE_PAGO_INICIAL_INCIERTO =
  'La venta ya quedó registrada, pero no pudimos confirmar si el pago inicial se registró. Revisá la cuenta del deudor antes de volver a cobrarlo.'
export const MENSAJE_COMPROBANTE_PENDIENTE =
  'La venta ya quedó registrada, pero no pudimos cargar el comprobante. No la cargues de nuevo: reintentá o revisala en el Historial de ventas.'

export const AVISO_COMPROBANTE_PAGO_NO_REGISTRADO =
  'El pago inicial no quedó registrado: la venta figura como deuda total. Cobralo desde Deudores.'
export const AVISO_COMPROBANTE_PAGO_INCIERTO =
  'No pudimos confirmar el pago inicial. Revisá la cuenta del deudor en Deudores antes de cobrarlo de nuevo.'
