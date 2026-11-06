/** Origen de la venta. */
export type CanalVenta = 'mostrador' | 'digital'

/** Modalidad en que el cliente recibe la mercaderia. */
export type TipoEntrega = 'retiro' | 'envio'

/** Unidad de venta del articulo. */
export type FormatoArticulo = 'unidad' | 'granel'

/** Articulo cargado en el carrito, con sus montos ya calculados fuera de la vista. */
export interface ArticuloCarrito {
  /** Identificador del producto en el catalogo. */
  idProducto: string
  nombreProducto: string
  categoria: string
  formato: FormatoArticulo
  /** URL de la imagen; si falta, se muestra un marcador de posicion. */
  urlImagen?: string
  precioUnitario: number
  cantidad: number
  /** Resultado de precioUnitario * cantidad. */
  montoTotal: number
  /** Stock fisico disponible; si la cantidad lo supera se muestra una alerta visual. */
  stockDisponible: number
}

/** Producto del catalogo que coincide con el texto buscado. */
export interface ResultadoBusqueda {
  idProducto: string
  nombreProducto: string
  /** URL de la miniatura del producto; conviene que sea una version chica, no la original. */
  urlImagen?: string
  precioUnitario: number
  stockDisponible: number
}

/** Estado de la venta en curso; la vista solo lo renderiza. */
export interface EstadoVentaEnCurso {
  canalVenta: CanalVenta
  tipoEntrega: TipoEntrega
  articulos: ArticuloCarrito[]
  subtotal: number
}

/** Props del componente presentacional de la Seccion 1 de Registrar Venta. */
export interface RegistrarVentaCarritoProps {
  estadoVenta: EstadoVentaEnCurso
  /** Texto actual del buscador (componente controlado). */
  textoBusqueda: string
  /** Coincidencias a mostrar en el desplegable; vacio si no hay texto buscado. */
  resultadosBusqueda: ResultadoBusqueda[]
  onBuscarProducto: (textoBusqueda: string) => void
  onAgregarProducto: (idProducto: string) => void
  onCambiarCanal: (canalVenta: CanalVenta) => void
  onCambiarEntrega: (tipoEntrega: TipoEntrega) => void
  onAumentarCantidad: (idProducto: string) => void
  onDisminuirCantidad: (idProducto: string) => void
  onEliminarArticulo: (idProducto: string) => void
  onContinuarACobro: () => void
}
