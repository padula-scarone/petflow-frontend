import { useId, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { ImagenProducto } from '@/features/ventas/components/imagen-producto'
import { useNavegacionSugerencias } from '@/features/ventas/hooks/use-navegacion-sugerencias'

/** Producto del catalogo que coincide con el texto buscado. */
export interface ResultadoBuscadorProducto<Identificador extends string | number> {
  idProducto: Identificador
  nombreProducto: string
  /** URL de la miniatura del producto; conviene que sea una version chica, no la original. */
  urlImagen?: string
  /** Si viene, se muestra bajo el nombre. */
  categoria?: string
  /** Si viene, se muestra bajo el nombre como "Unidad" o "Granel". */
  formato?: 'unidad' | 'granel'
  precioUnitario: number
  stockDisponible: number
}

const ETIQUETA_FORMATO = { unidad: 'Unidad', granel: 'Granel' } as const

/** "Categoria · Unidad", o lo que haya de eso; vacio si el resultado no trae ninguno de los dos datos. */
function describirProducto<Identificador extends string | number>(
  resultado: ResultadoBuscadorProducto<Identificador>,
) {
  return [resultado.categoria, resultado.formato && ETIQUETA_FORMATO[resultado.formato]]
    .filter(Boolean)
    .join(' · ')
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
  /** true: un producto sin stock se ve en la lista pero no se puede elegir. */
  bloquearSinStock?: boolean
  /** Productos que se ofrecen mientras no hay texto (solo con modoResultados en-linea). */
  sugerencias?: ResultadoBuscadorProducto<Identificador>[]
  /** Encabezado de las sugerencias, por ejemplo "De igual o mayor valor". */
  tituloSugerencias?: string
}

export function BuscadorProductos<Identificador extends string | number>({
  textoBusqueda,
  resultadosBusqueda,
  onBuscarProducto,
  onAgregarProducto,
  placeholder = 'Buscar por nombre',
  etiquetaAccesible = 'Buscar producto por nombre',
  modoResultados = 'flotante',
  bloquearSinStock = false,
  sugerencias = [],
  tituloSugerencias,
}: BuscadorProductosProps<Identificador>) {
  // Solo estado de presentacion: si el foco esta dentro del buscador (el campo o la lista)
  const [enfocado, setEnfocado] = useState(false)
  const campoReferencia = useRef<HTMLInputElement>(null)
  const desplegableVisible = textoBusqueda.trim() !== ''
  // Sin texto se ofrecen las sugerencias, solo al enfocar el campo y solo en linea:
  // una lista siempre abierta tapa el formulario
  const mostrarSugerencias =
    !desplegableVisible && enfocado && modoResultados === 'en-linea' && sugerencias.length > 0
  const resultadosVisibles = desplegableVisible ? resultadosBusqueda : sugerencias
  const listaVisible = desplegableVisible || mostrarSugerencias

  // --- NAVEGACION CON FLECHAS ---
  const idLista = useId()
  const sinStock =(resultado: ResultadoBuscadorProducto<Identificador>) =>
    bloquearSinStock && resultado.stockDisponible <= 0
  const elegirResultado = (resultado: ResultadoBuscadorProducto<Identificador>) => {
    onAgregarProducto(resultado.idProducto)
    // Elegido el producto, la lista se cierra; el campo se vuelve a abrir al enfocarlo
    campoReferencia.current?.blur()
  }
  const navegacion = useNavegacionSugerencias({
    idLista,
    listaVisible,
    // Con la lista cerrada no hay nada que recorrer, aunque haya resultados guardados
    opcionesHabilitadas: listaVisible ? resultadosVisibles.map((resultado) => !sinStock(resultado)) : [],
    alElegir: (indiceOpcion) => elegirResultado(resultadosVisibles[indiceOpcion]),
  })

  return (
    <div
      className="relative"
      // Marca para el modal que lo contiene: con la lista abierta, Escape es del buscador y no cierra el modal
      data-buscador-abierto={listaVisible ? '' : undefined}
      onFocus={() => setEnfocado(true)}
      // Escape vacia el texto o, con las sugerencias abiertas, las cierra: desde el campo o desde la lista, y sin
      // cerrar el modal que contenga al buscador
      onKeyDown={(evento) => {
        if (evento.key !== 'Escape') return
        if (textoBusqueda !== '') {
          evento.stopPropagation()
          onBuscarProducto('')
        } else if (mostrarSugerencias) {
          evento.stopPropagation()
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        }
      }}
      // Mover el foco dentro del buscador no lo cierra; al salir, la lista se cierra y no queda nada resaltado
      onBlur={(evento) => {
        if (evento.currentTarget.contains(evento.relatedTarget)) return
        setEnfocado(false)
        navegacion.reiniciar()
      }}
    >
      {/* --- CAMPO DE BUSQUEDA --- */}
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-[1.375rem] left-3 size-5 -translate-y-1/2 text-texto-suave"
      />
      <Input
        ref={campoReferencia}
        type="text"
        autoComplete="off"
        aria-label={etiquetaAccesible}
        placeholder={placeholder}
        className="h-11 bg-fondo-tarjeta pl-10"
        value={textoBusqueda}
        {...navegacion.propiedadesCampo}
        onChange={(evento) => {
          // Otro texto, otra lista: se empieza de nuevo sin nada resaltado
          navegacion.reiniciar()
          onBuscarProducto(evento.target.value)
        }}
      />

      {/* --- DESPLEGABLE DE RESULTADOS --- */}
      {listaVisible && (
        <ul
          {...navegacion.propiedadesLista}
          // Tocar un sugerido no debe sacar el foco del campo antes del clic: si no, la lista se cierra y el clic se pierde
          onMouseDown={(evento) => evento.preventDefault()}
          className={cn(
            'max-h-72 overflow-y-auto rounded-grande border bg-fondo-desplegable p-1 text-texto-desplegable shadow-md',
            modoResultados === 'flotante' ? 'absolute inset-x-0 top-full z-20 mt-1' : 'mt-2',
          )}
        >
          {mostrarSugerencias && tituloSugerencias && (
            <li className="px-3 pt-2 pb-1 text-xs font-medium text-texto-suave">{tituloSugerencias}</li>
          )}
          {resultadosVisibles.length === 0 ? (
            <li className="px-3 py-3 text-sm text-texto-suave">
              Sin resultados
            </li>
          ) : (
            resultadosVisibles.map((resultado, indiceResultado) => {
              const resultadoSinStock = sinStock(resultado)
              const detalleProducto = describirProducto(resultado)
              return (
              <li key={resultado.idProducto} role="presentation">
                <button
                  type="button"
                  disabled={resultadoSinStock}
                  {...navegacion.propiedadesOpcion(indiceResultado)}
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-mediano px-3 py-2 text-left text-sm aria-selected:bg-fondo-seleccion focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => elegirResultado(resultado)}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <ImagenProducto
                      urlImagen={resultado.urlImagen}
                      className="size-10"
                    />
                    {/* Nada se corta con puntos suspensivos: lo que no entra pasa al renglon siguiente */}
                    <span className="flex min-w-0 flex-col">
                      <span className="font-medium tabular-nums">{resultado.nombreProducto}</span>
                      {detalleProducto !== '' && (
                        <span className="text-xs text-texto-suave">{detalleProducto}</span>
                      )}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end text-xs tabular-nums sm:flex-row sm:gap-4">
                    <span className="font-medium">
                      {formatearMoneda(resultado.precioUnitario)}
                    </span>
                    <span className={resultadoSinStock ? 'font-medium text-peligro' : 'text-texto-suave'}>
                      {resultadoSinStock ? 'Sin stock' : `Stock: ${resultado.stockDisponible}`}
                    </span>
                  </span>
                </button>
              </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
