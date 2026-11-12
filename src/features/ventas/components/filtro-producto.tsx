import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EtiquetaFiltro, type VarianteFiltro } from '@/features/ventas/components/etiqueta-filtro'
import type { ProductoFiltro } from '@/features/ventas/types/historial'

/** Props del filtro por producto. */
interface FiltroProductoProps {
  idCampo: string
  variante: VarianteFiltro
  productoSeleccionado: ProductoFiltro | null
  textoBusqueda: string
  productosCoincidentes: ProductoFiltro[]
  onBuscarProducto: (textoBusqueda: string) => void
  onSeleccionarProducto: (producto: ProductoFiltro | null) => void
}

export function FiltroProducto({
  idCampo,
  variante,
  productoSeleccionado,
  textoBusqueda,
  productosCoincidentes,
  onBuscarProducto,
  onSeleccionarProducto,
}: FiltroProductoProps) {
  const idLista = `${idCampo}-resultados`
  const desplegableVisible = textoBusqueda.trim() !== ''

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <EtiquetaFiltro variante={variante} idCampo={idCampo}>
        Producto
      </EtiquetaFiltro>

      {/* --- PRODUCTO ELEGIDO --- */}
      {productoSeleccionado ? (
        <div className="flex h-11 items-center justify-between gap-1 rounded-mediano border border-borde-campo bg-fondo-seleccion pl-3">
          <span id={idCampo} className="truncate text-sm font-medium">
            <span className="sr-only">Producto: </span>
            {productoSeleccionado.nombreProducto}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Quitar el filtro por producto"
            className="size-11 shrink-0"
            onClick={() => onSeleccionarProducto(null)}
          >
            <X />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-texto-suave"
          />
          <Input
            id={idCampo}
            type="text"
            autoComplete="off"
            placeholder="Buscar producto"
            aria-label={variante === 'barra' ? 'Producto' : undefined}
            className="h-11 bg-fondo-tarjeta pl-10"
            value={textoBusqueda}
            aria-controls={desplegableVisible ? idLista : undefined}
            onChange={(evento) => onBuscarProducto(evento.target.value)}
            // Escape cierra el desplegable sin elegir nada
            onKeyDown={(evento) => {
              if (evento.key === 'Escape') onBuscarProducto('')
            }}
          />

          {/* --- COINCIDENCIAS --- */}
          {desplegableVisible && (
            <ul
              id={idLista}
              className="absolute inset-x-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-grande border bg-fondo-desplegable p-1 text-texto-desplegable shadow-md"
            >
              {productosCoincidentes.length === 0 ? (
                <li className="px-3 py-3 text-sm text-texto-suave">Sin resultados</li>
              ) : (
                productosCoincidentes.map((producto) => (
                  <li key={producto.idProducto}>
                    <button
                      type="button"
                      className="flex min-h-11 w-full items-center rounded-mediano px-3 py-2 text-left text-sm hover:bg-fondo-hover focus-visible:bg-fondo-hover focus-visible:outline-none"
                      onClick={() => onSeleccionarProducto(producto)}
                    >
                      {producto.nombreProducto}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
