import { BarraBusquedaDeudores } from '@/features/ventas/deudores/components/barra-busqueda-deudores'
import { ListaDeudoresEstados } from '@/features/ventas/deudores/components/lista-deudores'
import type { ListaDeudoresProps } from '@/features/ventas/deudores/types/cuenta-corriente'

/** Pantalla Ventas > Deudores: quien debe, cuanto y para cuando. */
export function Deudores({
  filtros,
  estadoLista,
  onCambiarBusqueda,
  onCambiarProximoPago,
  onCambiarFechaProximoPago,
  onLimpiarFiltros,
  onCambiarPagina,
  onAbrirFicha,
  onReintentar,
}: ListaDeudoresProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-bloque">
      {/* Sin titulo visible: la pestana de la seccion ya dice donde estamos */}
      <h1 className="sr-only">Deudores</h1>

      <BarraBusquedaDeudores
        filtros={filtros}
        onCambiarBusqueda={onCambiarBusqueda}
        onCambiarProximoPago={onCambiarProximoPago}
        onCambiarFechaProximoPago={onCambiarFechaProximoPago}
      />

      <ListaDeudoresEstados
        estadoLista={estadoLista}
        onAbrirFicha={onAbrirFicha}
        onCambiarPagina={onCambiarPagina}
        onReintentar={onReintentar}
        onLimpiarFiltros={onLimpiarFiltros}
      />
    </section>
  )
}
