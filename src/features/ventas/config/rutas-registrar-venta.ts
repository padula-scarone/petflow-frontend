/** Ids de Registrar Venta en MODULOS_MENU; la ruta se deriva de ellos. */
export const ID_MODULO_VENTAS = 'ventas'
export const ID_SECCION_REGISTRAR_VENTA = 'registrar-venta'

const RUTA_BASE = `/${ID_MODULO_VENTAS}/${ID_SECCION_REGISTRAR_VENTA}`

/** Rutas absolutas de las tres pantallas de Registrar Venta. */
export const RUTAS_REGISTRAR_VENTA = {
  carrito: RUTA_BASE,
  cobro: `${RUTA_BASE}/cobro`,
  comprobante: `${RUTA_BASE}/comprobante`,
} as const
