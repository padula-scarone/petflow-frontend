import { ArrowLeftRight, FilterX, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TablaDevoluciones } from '@/features/ventas/devoluciones/components/tabla-devoluciones'
import { TarjetaDevolucion } from '@/features/ventas/devoluciones/components/tarjeta-devolucion'
import type {
  EstadoListaDevoluciones,
  PropiedadesAccionesDevolucion,
} from '@/features/ventas/devoluciones/types/devolucion'
import { EstadoCargandoLista } from '@/features/ventas/components/estado-cargando-lista'
import { EstadoErrorLista } from '@/features/ventas/components/estado-error-lista'
import { EstadoVacioLista } from '@/features/ventas/components/estado-vacio-lista'
import { PaginacionLista } from '@/features/ventas/components/paginacion-lista'

/** Props de la lista de devoluciones: muestra el estado que corresponda (cargando, vacio, error o datos). */
interface ListaDevolucionesProps {
  estadoLista: EstadoListaDevoluciones
  acciones: PropiedadesAccionesDevolucion
  onCambiarPagina: (pagina: number) => void
  onReintentar: () => void
  onLimpiarFiltros: () => void
  onCargarNuevaDevolucion: () => void
}

export function ListaDevoluciones({
  estadoLista,
  acciones,
  onCambiarPagina,
  onReintentar,
  onLimpiarFiltros,
  onCargarNuevaDevolucion,
}: ListaDevolucionesProps) {
  if (estadoLista.tipo === 'cargando') return <EstadoCargandoLista textoAccesible="Cargando devoluciones" />
  if (estadoLista.tipo === 'error') {
    return (
      <EstadoErrorLista
        titulo="No se pudieron cargar las devoluciones"
        mensaje={estadoLista.mensaje}
        onReintentar={onReintentar}
      />
    )
  }

  // sin-devoluciones: todavia no hay ninguna. sin-resultados: hay devoluciones, pero los filtros no devuelven ninguna
  if (estadoLista.tipo === 'sin-devoluciones') {
    return (
      <EstadoVacioLista
        icono={ArrowLeftRight}
        titulo="Todavía no hay devoluciones registradas"
        descripcion="Cuando un cliente haga una devolución, la vas a ver acá."
        accion={
          <Button type="button" className="gap-2" onClick={onCargarNuevaDevolucion}>
            <Plus />
            Cargar nueva devolución
          </Button>
        }
      />
    )
  }
  if (estadoLista.tipo === 'sin-resultados') {
    return (
      <EstadoVacioLista
        icono={FilterX}
        titulo="No encontramos devoluciones con estos filtros"
        descripcion="Probá con otro rango de fechas o quitá algún filtro."
        accion={
          <Button type="button" variant="outline" className="bg-fondo-tarjeta" onClick={onLimpiarFiltros}>
            Limpiar filtros
          </Button>
        }
      />
    )
  }

  const { filas, paginacion } = estadoLista

  return (
    <div className="flex flex-col gap-bloque">
      {/* --- TARJETAS (HASTA XL) --- */}
      {/* grid-cols-1 = minmax(0, 1fr): sin esto la columna crece al ancho del contenido y la tarjeta se corta */}
      <ul className="grid grid-cols-1 gap-interno md:grid-cols-2 xl:hidden">
        {filas.map((fila) => (
          <li key={fila.idDevolucion} className="min-w-0">
            <TarjetaDevolucion fila={fila} acciones={acciones} />
          </li>
        ))}
      </ul>

      {/* --- TABLA (DESDE XL) --- */}
      <div className="hidden xl:block">
        <TablaDevoluciones filas={filas} acciones={acciones} />
      </div>

      <PaginacionLista paginacion={paginacion} onCambiarPagina={onCambiarPagina} />
    </div>
  )
}
