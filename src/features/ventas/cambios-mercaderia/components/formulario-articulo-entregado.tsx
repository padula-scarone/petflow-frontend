import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  /** Productos de igual o mayor valor que lo devuelto, que se ofrecen mientras no se escribe nada. */
  sugerencias: ProductoCatalogoCambio[]
  /** Valor de lo devuelto: se nombra en el encabezado de las sugerencias. */
  valorDevuelto: number
  erroresCampo: ValidacionCambio['erroresCampo']
  acciones: AccionesAltaCambio
}

/** Articulo entregado (sale): producto del catalogo, al precio actual, y su cantidad. */
export function FormularioArticuloEntregado({
  borrador,
  textoBusqueda,
  resultadosBusqueda,
  sugerencias,
  valorDevuelto,
  erroresCampo,
  acciones,
}: FormularioArticuloEntregadoProps) {
  const articulo = borrador.articuloEntregado

  return (
    <section aria-labelledby="titulo-articulo-entregado" className="flex min-w-0 flex-col gap-3">
      {/* El valor de lo devuelto es el dato que guia la eleccion: va como texto principal, no como aclaracion */}
      <p className="text-base">
        El cliente devuelve <span className="font-bold tabular-nums">{formatearMoneda(valorDevuelto)}</span>.{' '}
        Elegí un artículo de igual o mayor valor.
      </p>
      <h2 id="titulo-articulo-entregado" className="text-base font-bold">
        Artículo que se lleva
      </h2>

      <BuscadorProductos
        textoBusqueda={textoBusqueda}
        resultadosBusqueda={resultadosBusqueda}
        placeholder="Buscar el artículo que se lleva"
        etiquetaAccesible="Buscar el artículo que se lleva"
        modoResultados="en-linea"
        // Un producto sin stock se ve pero no se puede elegir; sin texto se sugieren los de igual o mayor valor
        bloquearSinStock
        // Tambien con un articulo ya elegido: asi se puede cambiar por otro sin saber los precios
        sugerencias={sugerencias.filter((producto) => producto.idProducto !== articulo?.idProducto)}
        tituloSugerencias="Sugeridos, de menor a mayor precio"
        onBuscarProducto={acciones.onBuscarProductoEntregado}
        onAgregarProducto={acciones.onSeleccionarProductoEntregado}
      />

      {articulo && (
        <div className="flex flex-col gap-3 rounded-grande border bg-fondo-seleccion/40 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 font-medium wrap-break-word">{articulo.nombreProducto}</p>
            <div className="-my-2 -mr-2 flex shrink-0 items-center gap-1">
              <p className="text-sm tabular-nums text-texto-suave">
                {formatearMoneda(articulo.precioUnitario)}
                {articulo.formatoVenta === 'GRANEL' ? '/kg' : ''}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Quitar ${articulo.nombreProducto}`}
                className="size-11"
                onClick={acciones.onQuitarProductoEntregado}
              >
                <X />
              </Button>
            </div>
          </div>
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
