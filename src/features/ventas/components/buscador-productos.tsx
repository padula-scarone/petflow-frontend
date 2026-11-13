import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { ImagenProducto } from '@/features/ventas/components/imagen-producto'

/** Producto del catalogo que coincide con el texto buscado. */
export interface ResultadoBuscadorProducto<Identificador extends string | number> {
  idProducto: Identificador
  nombreProducto: string
  /** URL de la miniatura del producto; conviene que sea una version chica, no la original. */
  urlImagen?: string
  precioUnitario: number
  stockDisponible: number
}

/** Props del buscador de productos con desplegable de coincidencias. */
interface BuscadorProductosProps<Identificador extends string | number> {
  textoBusqueda: string
  resultadosBusqueda: ResultadoBuscadorProducto<Identificador>[]
  onBuscarProducto: (textoBusqueda: string) => void
  onAgregarProducto: (idProducto: Identificador) => void
  /** Por defecto "Buscar por nombre". */
  placeholder?: string
  /** Por defecto "Buscar producto por nombre". */
  etiquetaAccesible?: string
  /**
   * flotante: lista sobre el contenido (carrito). en-linea: la lista empuja el contenido; es la
   * opcion para campos dentro de un cuerpo con scroll, donde una lista flotante quedaria cortada.
   */
  modoResultados?: 'flotante' | 'en-linea'
}

export function BuscadorProductos<Identificador extends string | number>({
  textoBusqueda,
  resultadosBusqueda,
  onBuscarProducto,
  onAgregarProducto,
  placeholder = 'Buscar por nombre',
  etiquetaAccesible = 'Buscar producto por nombre',
  modoResultados = 'flotante',
}: BuscadorProductosProps<Identificador>) {
  const desplegableVisible = textoBusqueda.trim() !== ''

  return (
    <div className="relative">
      {/* --- CAMPO DE BUSQUEDA --- */}
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-[1.375rem] left-3 size-5 -translate-y-1/2 text-texto-suave"
      />
      <Input
        type="text"
        autoComplete="off"
        aria-label={etiquetaAccesible}
        placeholder={placeholder}
        className="h-11 bg-fondo-tarjeta pl-10"
        value={textoBusqueda}
        onChange={(evento) => onBuscarProducto(evento.target.value)}
        // Escape vacia el texto y cierra la lista sin elegir nada
        onKeyDown={(evento) => {
          if (evento.key === 'Escape' && textoBusqueda !== '') {
            evento.stopPropagation()
            onBuscarProducto('')
          }
        }}
      />

      {/* --- DESPLEGABLE DE RESULTADOS --- */}
      {desplegableVisible && (
        <ul
          className={cn(
            'max-h-72 overflow-y-auto rounded-grande border bg-fondo-desplegable p-1 text-texto-desplegable shadow-md',
            modoResultados === 'flotante' ? 'absolute inset-x-0 top-full z-20 mt-1' : 'mt-2',
          )}
        >
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
                    <span className="truncate font-medium tabular-nums">
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
