import { CampoCantidad } from '@/features/ventas/cambios-mercaderia/components/campo-cantidad'
import type {
  AccionesAltaCambio,
  BorradorCambio,
  ProductoCatalogoCambio,
  ValidacionCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import { BuscadorProductos } from '@/features/ventas/components/buscador-productos'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props del formulario del articulo que se lleva el cliente. */
interface FormularioArticuloEntregadoProps {
  borrador: BorradorCambio
  textoBusqueda: string
  resultadosBusqueda: ProductoCatalogoCambio[]
  erroresCampo: ValidacionCambio['erroresCampo']
  acciones: AccionesAltaCambio
}

/** Articulo entregado (sale): producto del catalogo, al precio actual, y su cantidad. */
export function FormularioArticuloEntregado({
  borrador,
  textoBusqueda,
  resultadosBusqueda,
  erroresCampo,
  acciones,
}: FormularioArticuloEntregadoProps) {
  const articulo = borrador.articuloEntregado

  return (
    <section aria-labelledby="titulo-articulo-entregado" className="flex min-w-0 flex-col gap-3">
      <h2 id="titulo-articulo-entregado" className="text-base font-bold">
        Artículo que se lleva
      </h2>

      <BuscadorProductos
        textoBusqueda={textoBusqueda}
        resultadosBusqueda={resultadosBusqueda}
        placeholder="Buscar el artículo que se lleva"
        etiquetaAccesible="Buscar el artículo que se lleva"
        modoResultados="en-linea"
        onBuscarProducto={acciones.onBuscarProductoEntregado}
        onAgregarProducto={acciones.onSeleccionarProductoEntregado}
      />

      {articulo && (
        <div className="flex flex-col gap-3 rounded-grande border bg-fondo-seleccion/40 p-3">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 font-medium wrap-break-word">{articulo.nombreProducto}</p>
            <p className="shrink-0 text-sm tabular-nums text-texto-suave">
              {formatearMoneda(articulo.precioUnitario)}
              {articulo.formatoVenta === 'GRANEL' ? '/kg' : ''}
            </p>
          </div>
          <p className="text-xs text-texto-suave">Precio actual del catálogo</p>
          <CampoCantidad
            idCampo="cantidad-entregada"
            etiqueta={articulo.formatoVenta === 'GRANEL' ? 'Cantidad entregada (kg)' : 'Cantidad entregada (u)'}
            valor={articulo.cantidad}
            admiteDecimales={articulo.formatoVenta === 'GRANEL'}
            unidad={articulo.formatoVenta === 'GRANEL' ? 'kg' : 'u'}
            error={erroresCampo.cantidadEntregada}
            ayuda={`Stock disponible: ${articulo.stockDisponible} ${articulo.formatoVenta === 'GRANEL' ? 'kg' : 'u'}`}
            onCambiar={acciones.onCambiarCantidadEntregada}
          />
        </div>
      )}
    </section>
  )
}
