import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatearMoneda } from '@/lib/formatear-moneda'
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
        className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="text"
        aria-label="Buscar producto por nombre"
        placeholder="Buscar por nombre"
        className="h-11 bg-card pl-10"
        value={textoBusqueda}
        onChange={(evento) => onBuscarProducto(evento.target.value)}
      />

      {/* --- DESPLEGABLE DE RESULTADOS --- */}
      {desplegableVisible && (
        <ul className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
          {resultadosBusqueda.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted-foreground">
              Sin resultados
            </li>
          ) : (
            resultadosBusqueda.map((resultado) => (
              <li key={resultado.idProducto}>
                <button
                  type="button"
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-primary-muted focus-visible:bg-primary-muted focus-visible:outline-none"
                  onClick={() => onAgregarProducto(resultado.idProducto)}
                >
                  <span className="min-w-0 truncate font-medium">
                    {resultado.nombreProducto}
                  </span>
                  <span className="flex shrink-0 flex-col items-end text-xs tabular-nums sm:flex-row sm:gap-4">
                    <span className="font-medium">
                      {formatearMoneda(resultado.precioUnitario)}
                    </span>
                    <span className="text-muted-foreground">
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
