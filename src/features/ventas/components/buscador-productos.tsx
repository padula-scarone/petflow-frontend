import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { ImagenProducto } from '@/features/ventas/components/imagen-producto'
import type { ResultadoBusqueda } from '@/features/ventas/types/venta'

/** Props del buscador de productos con desplegable de coincidencias. */
interface BuscadorProductosProps {
  textoBusqueda: string
  resultadosBusqueda: ResultadoBusqueda[]
  onBuscarProducto: (textoBusqueda: string) => void
  onAgregarProducto: (idProducto: string) => void
}

export function BuscadorProductos({
  textoBusqueda,
  resultadosBusqueda,
  onBuscarProducto,
  onAgregarProducto,
}: BuscadorProductosProps) {
  const desplegableVisible = textoBusqueda.trim() !== ''

  return (
    <div className="relative">
      {/* --- CAMPO DE BUSQUEDA --- */}
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-texto-suave"
      />
      <Input
        type="text"
        aria-label="Buscar producto por nombre"
        placeholder="Buscar por nombre"
        className="h-11 bg-fondo-tarjeta pl-10"
        value={textoBusqueda}
        onChange={(evento) => onBuscarProducto(evento.target.value)}
      />

      {/* --- DESPLEGABLE DE RESULTADOS --- */}
      {desplegableVisible && (
        <ul className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-grande border bg-fondo-desplegable p-1 text-texto-desplegable shadow-md">
          {resultadosBusqueda.length === 0 ? (
            <li className="px-3 py-3 text-sm text-texto-suave">
              Sin resultados
            </li>
          ) : (
            resultadosBusqueda.map((resultado) => (
              <li key={resultado.idProducto}>
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-mediano px-3 py-2 text-left text-sm hover:bg-fondo-hover focus-visible:bg-fondo-hover focus-visible:outline-none"
                  onClick={() => onAgregarProducto(resultado.idProducto)}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <ImagenProducto
                      urlImagen={resultado.urlImagen}
                      className="size-10"
                    />
                    <span className="truncate font-medium">
                      {resultado.nombreProducto}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end text-xs tabular-nums sm:flex-row sm:gap-4">
                    <span className="font-medium">
                      {formatearMoneda(resultado.precioUnitario)}
                    </span>
                    <span className="text-texto-suave">
                      Stock: {resultado.stockDisponible}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
