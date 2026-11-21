import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EtiquetaFiltro, type VarianteFiltro } from '@/features/ventas/components/etiqueta-filtro'
import { useNavegacionSugerencias } from '@/features/ventas/hooks/use-navegacion-sugerencias'
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
  const navegacion = useNavegacionSugerencias({
    idLista,
    listaVisible: desplegableVisible,
    opcionesHabilitadas: desplegableVisible ? productosCoincidentes.map(() => true) : [],
    alElegir: (indiceOpcion) => onSeleccionarProducto(productosCoincidentes[indiceOpcion]),
  })

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <EtiquetaFiltro variante={variante} idCampo={idCampo}>
        Producto
      </EtiquetaFiltro>

      {/* --- PRODUCTO ELEGIDO --- */}
      {productoSeleccionado ? (
        <div className="flex h-control items-center justify-between gap-1 rounded-mediano border border-borde-campo bg-fondo-seleccion pl-3">
          <span id={idCampo} className="truncate text-cuerpo font-medium">
            <span className="sr-only">Producto: </span>
            {productoSeleccionado.nombreProducto}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Quitar el filtro por producto"
            className="size-control shrink-0"
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
            className="bg-fondo-tarjeta pl-10"
            value={textoBusqueda}
            {...navegacion.propiedadesCampo}
            onChange={(evento) => {
              // Otro texto, otra lista: se empieza de nuevo sin nada resaltado
              navegacion.reiniciar()
              onBuscarProducto(evento.target.value)
            }}
            // Escape cierra el desplegable sin elegir nada; las flechas y Enter los maneja la navegacion
            onKeyDown={(evento) => {
              if (evento.key === 'Escape') onBuscarProducto('')
              else navegacion.propiedadesCampo.onKeyDown(evento)
            }}
          />

          {/* --- COINCIDENCIAS --- */}
          {desplegableVisible && (
            <ul
              {...navegacion.propiedadesLista}
              className="absolute inset-x-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-grande border bg-fondo-desplegable p-1 text-texto-desplegable shadow-md"
            >
              {productosCoincidentes.length === 0 ? (
                <li className="px-3 py-3 text-cuerpo text-texto-suave">Sin resultados</li>
              ) : (
                productosCoincidentes.map((producto, indiceProducto) => (
                  <li key={producto.idProducto} role="presentation">
                    <button
                      type="button"
                      {...navegacion.propiedadesOpcion(indiceProducto)}
                      className="flex min-h-control w-full items-center rounded-mediano px-3 py-2 text-left text-cuerpo aria-selected:bg-fondo-seleccion focus-visible:outline-none"
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
