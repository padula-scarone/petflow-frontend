import { useState } from 'react'
import {
  CANTIDAD_INICIAL_GRANEL_GRAMOS,
  CANTIDAD_MAXIMA_RESULTADOS_BUSQUEDA,
  CANTIDAD_MINIMA_GRANEL_GRAMOS,
  PASO_GRANEL_GRAMOS,
} from '@/features/ventas/config/reglas-venta'
import type { PropiedadesCarrito } from '@/features/ventas/types/contexto-registrar-venta'
import type {
  ArticuloCarrito,
  CanalVenta,
  ProductoCatalogo,
  TipoEntrega,
} from '@/features/ventas/types/venta'
import {
  calcularSubtotalLineaCentavos,
  convertirCentavosAPesos,
  convertirPesosACentavos,
} from '@/features/ventas/utils/calcular-centavos'
import { normalizarTextoBusqueda } from '@/features/ventas/utils/normalizar-texto-busqueda'

function recalcularArticulo(articulo: ArticuloCarrito, cantidad: number): ArticuloCarrito {
  const subtotalCentavos = calcularSubtotalLineaCentavos(
    convertirPesosACentavos(articulo.precioUnitario),
    cantidad,
  )
  return { ...articulo, cantidad, montoTotal: convertirCentavosAPesos(subtotalCentavos) }
}

const GRAMOS_POR_KILO = 1000

function crearArticulo(producto: ProductoCatalogo): ArticuloCarrito {
  // Un producto a granel entra con su peso inicial; el resto, con una unidad
  const cantidadInicial =
    producto.formato === 'granel' ? CANTIDAD_INICIAL_GRANEL_GRAMOS / GRAMOS_POR_KILO : 1
  return recalcularArticulo(
    {
      idProducto: producto.idProducto,
      nombreProducto: producto.nombreProducto,
      categoria: producto.categoria,
      formato: producto.formato,
      urlImagen: producto.urlImagen,
      precioUnitario: producto.precioUnitario,
      cantidad: 1,
      montoTotal: producto.precioUnitario,
      stockDisponible: producto.stockDisponible,
    },
    cantidadInicial,
  )
}

/** Props del carrito que no dependen de la carga del catalogo; el orquestador agrega las que si. */
export type PropiedadesCarritoBase = Omit<PropiedadesCarrito, 'estadoCatalogo' | 'onReintentarCatalogo'>

/**
 * Carrito de la venta en curso: canal, entrega, buscador y articulos. Busca en el catalogo ya cargado,
 * sin pedir nada al back. Los articulos toman precio y stock del catalogo vigente, asi que una recarga
 * del catalogo (por ejemplo tras un rechazo por stock) se refleja en el carrito.
 */
export function useCarritoVenta(catalogo: ProductoCatalogo[]) {
  // --- ESTADOS ---
  const [canalVenta, setCanalVenta] = useState<CanalVenta>('mostrador')
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>('retiro')
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [articulosAgregados, setArticulosAgregados] = useState<ArticuloCarrito[]>([])

  // --- CALCULOS ---
  const productosPorId = new Map(catalogo.map((producto) => [producto.idProducto, producto]))
  // Un articulo que ya no esta en el catalogo conserva su ultimo dato
  const articulos = articulosAgregados.map((articulo) => {
    const producto = productosPorId.get(articulo.idProducto)
    return producto === undefined
      ? articulo
      : recalcularArticulo(
          {
            ...articulo,
            categoria: producto.categoria,
            precioUnitario: producto.precioUnitario,
            stockDisponible: producto.stockDisponible,
          },
          articulo.cantidad,
        )
  })
  const subtotalCentavos = articulos.reduce(
    (acumulado, articulo) => acumulado + convertirPesosACentavos(articulo.montoTotal),
    0,
  )

  const textoNormalizado = normalizarTextoBusqueda(textoBusqueda)
  const resultadosBusqueda =
    textoNormalizado === ''
      ? []
      : catalogo
          .filter((producto) =>
            normalizarTextoBusqueda(producto.nombreProducto).includes(textoNormalizado),
          )
          .slice(0, CANTIDAD_MAXIMA_RESULTADOS_BUSQUEDA)

  // --- ACCIONES ---
  /** Un producto por unidad suma de a una; uno a granel, de a PASO_GRANEL_GRAMOS, sin bajar del minimo. */
  const calcularCantidadNueva = (articulo: ArticuloCarrito, variacion: number) => {
    if (articulo.formato === 'granel') {
      const gramosActuales = Math.round(articulo.cantidad * GRAMOS_POR_KILO)
      // Si se bajo hasta el minimo, el primer + vuelve al paso exacto (100) y no a 101
      const gramos =
        gramosActuales === CANTIDAD_MINIMA_GRANEL_GRAMOS && variacion > 0
          ? variacion * PASO_GRANEL_GRAMOS
          : gramosActuales + variacion * PASO_GRANEL_GRAMOS
      return Math.max(CANTIDAD_MINIMA_GRANEL_GRAMOS, gramos) / GRAMOS_POR_KILO
    }
    return Math.max(1, articulo.cantidad + variacion)
  }

  const cambiarCantidad = (idProducto: string, variacion: number) =>
    setArticulosAgregados((actuales) =>
      actuales.map((articulo) =>
        articulo.idProducto === idProducto
          ? recalcularArticulo(articulo, calcularCantidadNueva(articulo, variacion))
          : articulo,
      ),
    )

  const cambiarPesoGranel = (idProducto: string, gramos: number) =>
    setArticulosAgregados((actuales) =>
      actuales.map((articulo) =>
        articulo.idProducto === idProducto && articulo.formato === 'granel'
          ? recalcularArticulo(
              articulo,
              Math.max(CANTIDAD_MINIMA_GRANEL_GRAMOS, Math.round(gramos)) / GRAMOS_POR_KILO,
            )
          : articulo,
      ),
    )

  const agregarProducto = (idProducto: string) => {
    const producto = productosPorId.get(idProducto)
    if (producto !== undefined) {
      setArticulosAgregados((actuales) =>
        actuales.some((articulo) => articulo.idProducto === idProducto)
          ? actuales.map((articulo) =>
              articulo.idProducto === idProducto
                ? recalcularArticulo(articulo, calcularCantidadNueva(articulo, 1))
                : articulo,
            )
          : [...actuales, crearArticulo(producto)],
      )
    }
    setTextoBusqueda('')
  }

  const propiedadesCarrito: PropiedadesCarritoBase = {
    estadoVenta: {
      canalVenta,
      tipoEntrega,
      articulos,
      subtotal: convertirCentavosAPesos(subtotalCentavos),
    },
    textoBusqueda,
    resultadosBusqueda,
    onBuscarProducto: setTextoBusqueda,
    onAgregarProducto: agregarProducto,
    onCambiarCanal: setCanalVenta,
    onCambiarEntrega: setTipoEntrega,
    onAumentarCantidad: (idProducto) => cambiarCantidad(idProducto, 1),
    onDisminuirCantidad: (idProducto) => cambiarCantidad(idProducto, -1),
    onCambiarPesoGranel: cambiarPesoGranel,
    onEliminarArticulo: (idProducto) =>
      setArticulosAgregados((actuales) =>
        actuales.filter((articulo) => articulo.idProducto !== idProducto),
      ),
  }

  return { canalVenta, tipoEntrega, articulos, subtotalCentavos, propiedadesCarrito }
}
