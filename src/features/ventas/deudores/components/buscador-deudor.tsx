import { useId, useRef } from 'react'
import { Loader2, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNavegacionSugerencias } from '@/features/ventas/hooks/use-navegacion-sugerencias'
import type { Deudor, EstadoBusquedaDeudor } from '@/features/ventas/deudores/types/deudor'

/** Props del buscador de deudores por nombre o DNI. */
interface BuscadorDeudorProps {
  textoBusqueda: string
  estadoBusqueda: EstadoBusquedaDeudor
  onBuscarDeudor: (texto: string) => void
  onReintentarBusqueda: () => void
  onSeleccionarDeudor: (deudor: Deudor) => void
  onNuevoDeudor: () => void
}

/**
 * Buscador de deudores con lista de coincidencias (combobox): nombre o DNI, parcial y sin distinguir mayusculas.
 * La lista flota debajo del campo, con la misma estetica que la del buscador de productos de Registrar Venta.
 * Siempre ofrece "Nuevo deudor" para quien todavia no esta cargado.
 */
export function BuscadorDeudor({
  textoBusqueda,
  estadoBusqueda,
  onBuscarDeudor,
  onReintentarBusqueda,
  onSeleccionarDeudor,
  onNuevoDeudor,
}: BuscadorDeudorProps) {
  const idCampo = useId()
  const idLista = useId()
  const campoReferencia = useRef<HTMLInputElement>(null)
  const listaVisible = estadoBusqueda.fase !== 'inactivo'
  const deudoresVisibles = estadoBusqueda.fase === 'con-resultados' ? estadoBusqueda.deudores : []

  const elegirDeudor = (deudor: Deudor) => {
    onSeleccionarDeudor(deudor)
    campoReferencia.current?.blur()
  }
  const navegacion = useNavegacionSugerencias({
    idLista,
    listaVisible,
    opcionesHabilitadas: deudoresVisibles.map(() => true),
    alElegir: (indiceOpcion) => elegirDeudor(deudoresVisibles[indiceOpcion]),
  })

  return (
    <div
      className="flex flex-col gap-interno"
      // Escape vacia el texto sin cerrar el dialogo o la pantalla que contenga al buscador
      onKeyDown={(evento) => {
        if (evento.key !== 'Escape' || textoBusqueda === '') return
        evento.stopPropagation()
        onBuscarDeudor('')
      }}
    >
      <Label htmlFor={idCampo} className="text-cuerpo text-texto-suave">
        Buscar deudor por nombre o DNI
      </Label>
      <div className="flex flex-col gap-interno sm:flex-row">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-texto-suave"
          />
          <Input
            id={idCampo}
            ref={campoReferencia}
            type="text"
            autoComplete="off"
            placeholder="Ej.: Marta o 20111222"
            className="bg-fondo-tarjeta pl-10"
            value={textoBusqueda}
            {...navegacion.propiedadesCampo}
            onChange={(evento) => {
              navegacion.reiniciar()
              onBuscarDeudor(evento.target.value)
            }}
          />

          {/* --- LISTA DE RESULTADOS --- */}
          {/* Dentro del contenedor del campo: flota debajo de el y mide lo mismo */}
          {listaVisible && (
            <ul
              {...navegacion.propiedadesLista}
              aria-label="Deudores encontrados"
              // Tocar un resultado no debe sacar el foco del campo antes del clic: si no, la lista se cierra y el clic se pierde
              onMouseDown={(evento) => evento.preventDefault()}
              className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-grande border bg-fondo-desplegable p-1 text-texto-desplegable shadow-flotante"
            >
              {estadoBusqueda.fase === 'cargando' && (
                <li role="presentation" className="flex items-center gap-interno px-3 py-3 text-cuerpo text-texto-suave">
                  <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
                  Buscando…
                </li>
              )}
              {estadoBusqueda.fase === 'error' && (
                <li role="presentation" className="flex flex-col items-start gap-interno px-3 py-3 text-cuerpo">
                  <span role="alert" className="text-peligro">
                    {estadoBusqueda.mensaje}
                  </span>
                  <Button type="button" variant="outline" className="bg-fondo-tarjeta" onClick={onReintentarBusqueda}>
                    Reintentar
                  </Button>
                </li>
              )}
              {estadoBusqueda.fase === 'sin-resultados' && (
                <li role="presentation" className="flex flex-col items-start gap-interno px-3 py-3 text-cuerpo">
                  <span role="status" className="text-texto-suave">
                    No encontramos a nadie con «{estadoBusqueda.textoBuscado}».
                  </span>
                  <Button type="button" variant="outline" className="bg-fondo-tarjeta" onClick={onNuevoDeudor}>
                    <Plus aria-hidden="true" />
                    Cargar como nuevo deudor
                  </Button>
                </li>
              )}
              {deudoresVisibles.map((deudor, indiceDeudor) => (
                <li key={deudor.idDeudor} role="presentation">
                  <button
                    type="button"
                    {...navegacion.propiedadesOpcion(indiceDeudor)}
                    className="flex min-h-control w-full items-center justify-between gap-interno rounded-mediano px-3 py-2 text-left text-cuerpo aria-selected:bg-fondo-seleccion focus-visible:outline-none"
                    onClick={() => elegirDeudor(deudor)}
                  >
                    <span className="min-w-0 font-medium">{deudor.nombreCompleto}</span>
                    <span className="shrink-0 text-auxiliar text-texto-suave tabular-nums">DNI {deudor.dni}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Button type="button" variant="outline" className="bg-fondo-tarjeta" onClick={onNuevoDeudor}>
          <Plus aria-hidden="true" />
          Nuevo deudor
        </Button>
      </div>
    </div>
  )
}
