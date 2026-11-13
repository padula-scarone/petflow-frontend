import { ArrowLeftRight, FilterX, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TablaCambios } from '@/features/ventas/cambios-mercaderia/components/tabla-cambios'
import { TarjetaCambio } from '@/features/ventas/cambios-mercaderia/components/tarjeta-cambio'
import type {
  EstadoListaCambios,
  PropiedadesAccionesCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import { EstadoCargandoLista } from '@/features/ventas/components/estado-cargando-lista'
import { EstadoErrorLista } from '@/features/ventas/components/estado-error-lista'
import { EstadoVacioLista } from '@/features/ventas/components/estado-vacio-lista'
import { PaginacionLista } from '@/features/ventas/components/paginacion-lista'

/** Props de la lista de cambios: muestra el estado que corresponda (cargando, vacio, error o datos). */
interface ListaCambiosProps {
  estadoLista: EstadoListaCambios
  acciones: PropiedadesAccionesCambio
  onCambiarPagina: (pagina: number) => void
  onReintentar: () => void
  onLimpiarFiltros: () => void
  onCargarNuevoCambio: () => void
}

export function ListaCambios({
  estadoLista,
  acciones,
  onCambiarPagina,
  onReintentar,
  onLimpiarFiltros,
  onCargarNuevoCambio,
}: ListaCambiosProps) {
  if (estadoLista.tipo === 'cargando') return <EstadoCargandoLista textoAccesible="Cargando cambios" />
  if (estadoLista.tipo === 'error') {
    return (
      <EstadoErrorLista
        titulo="No se pudieron cargar los cambios"
        mensaje={estadoLista.mensaje}
        onReintentar={onReintentar}
      />
    )
  }

  // sin-cambios: todavia no hay ninguno. sin-resultados: hay cambios, pero los filtros no devuelven ninguno
  if (estadoLista.tipo === 'sin-cambios') {
    return (
      <EstadoVacioLista
        icono={ArrowLeftRight}
        titulo="Todavía no hay cambios registrados"
        descripcion="Cuando un cliente cambie mercadería, lo vas a ver acá."
        accion={
          <Button type="button" className="h-11 gap-2 px-6" onClick={onCargarNuevoCambio}>
            <Plus />
            Cargar nuevo cambio
          </Button>
        }
      />
    )
  }
  if (estadoLista.tipo === 'sin-resultados') {
    return (
      <EstadoVacioLista
        icono={FilterX}
        titulo="No encontramos cambios con estos filtros"
        descripcion="Probá con otro rango de fechas o quitá algún filtro."
        accion={
          <Button type="button" variant="outline" className="h-11 bg-fondo-tarjeta px-6" onClick={onLimpiarFiltros}>
            Limpiar filtros
          </Button>
        }
      />
    )
  }

  const { filas, paginacion } = estadoLista

  return (
    <div className="flex flex-col gap-4">
      {/* --- TARJETAS (HASTA XL) --- */}
      {/* grid-cols-1 = minmax(0, 1fr): sin esto la columna crece al ancho del contenido y la tarjeta se corta */}
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:hidden">
        {filas.map((fila) => (
          <li key={fila.idCambio} className="min-w-0">
            <TarjetaCambio fila={fila} acciones={acciones} />
          </li>
        ))}
      </ul>

      {/* --- TABLA (DESDE XL) --- */}
      <div className="hidden xl:block">
        <TablaCambios filas={filas} acciones={acciones} />
      </div>

      <PaginacionLista paginacion={paginacion} onCambiarPagina={onCambiarPagina} />
    </div>
  )
}
