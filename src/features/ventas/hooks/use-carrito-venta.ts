import { useState } from 'react'
import { CANTIDAD_MAXIMA_RESULTADOS_BUSQUEDA } from '@/features/ventas/config/reglas-venta'
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

function crearArticulo(producto: ProductoCatalogo): ArticuloCarrito {
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
    1,
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
  const cambiarCantidad = (idProducto: string, variacion: number) =>
    setArticulosAgregados((actuales) =>
      actuales.map((articulo) =>
        articulo.idProducto === idProducto
          ? recalcularArticulo(articulo, Math.max(1, articulo.cantidad + variacion))
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
                ? recalcularArticulo(articulo, articulo.cantidad + 1)
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
    onEliminarArticulo: (idProducto) =>
      setArticulosAgregados((actuales) =>
        actuales.filter((articulo) => articulo.idProducto !== idProducto),
      ),
  }

  return { canalVenta, tipoEntrega, articulos, subtotalCentavos, propiedadesCarrito }
}
