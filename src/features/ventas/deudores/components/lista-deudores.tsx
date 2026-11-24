import { SearchX, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EstadoCargandoLista } from '@/features/ventas/components/estado-cargando-lista'
import { EstadoErrorLista } from '@/features/ventas/components/estado-error-lista'
import { EstadoVacioLista } from '@/features/ventas/components/estado-vacio-lista'
import { PaginacionLista } from '@/features/ventas/components/paginacion-lista'
import { TablaDeudores } from '@/features/ventas/deudores/components/tabla-deudores'
import { TarjetaDeudor } from '@/features/ventas/deudores/components/tarjeta-deudor'
import type { EstadoListaDeudores } from '@/features/ventas/deudores/types/cuenta-corriente'

/** Props de la lista de deudores: muestra el estado que corresponda (cargando, vacio, error o datos). */
interface ListaDeudoresEstadosProps {
  estadoLista: EstadoListaDeudores
  onAbrirFicha: (idDeudor: number) => void
  onCambiarPagina: (pagina: number) => void
  onReintentar: () => void
  onLimpiarFiltros: () => void
}

/** Cada estado de la lista con su salida; con datos, tarjetas hasta xl y tabla desde xl. */
export function ListaDeudoresEstados({
  estadoLista,
  onAbrirFicha,
  onCambiarPagina,
  onReintentar,
  onLimpiarFiltros,
}: ListaDeudoresEstadosProps) {
  if (estadoLista.tipo === 'cargando') return <EstadoCargandoLista textoAccesible="Cargando deudores" />
  if (estadoLista.tipo === 'error') {
    return (
      <EstadoErrorLista
        titulo="No se pudieron cargar los deudores"
        mensaje={estadoLista.mensaje}
        onReintentar={onReintentar}
      />
    )
  }
  // sin-deudores: nadie debe. sin-resultados: la busqueda o el filtro no devuelven a nadie
  if (estadoLista.tipo === 'sin-deudores') {
    return (
      <EstadoVacioLista
        icono={UsersRound}
        titulo="No hay deudores con saldo pendiente"
        descripcion="Cuando fíes una venta en Registrar Venta, vas a ver acá a quién se le fió."
        // Sin accion: los deudores nacen al fiar una venta, no desde aca
        accion={null}
      />
    )
  }
  if (estadoLista.tipo === 'sin-resultados') {
    return (
      <EstadoVacioLista
        icono={SearchX}
        titulo="No encontramos deudores"
        descripcion="Revisá el nombre o el DNI, o cambiá el filtro de próximo pago."
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
          <li key={fila.idDeudor} className="min-w-0">
            <TarjetaDeudor fila={fila} onAbrirFicha={onAbrirFicha} />
          </li>
        ))}
      </ul>

      {/* --- TABLA (DESDE XL) --- */}
      <div className="hidden xl:block">
        <TablaDeudores filas={filas} onAbrirFicha={onAbrirFicha} />
      </div>

      <PaginacionLista paginacion={paginacion} onCambiarPagina={onCambiarPagina} />
    </div>
  )
}
