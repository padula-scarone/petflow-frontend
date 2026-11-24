import { ContenedorFiltrosFijos } from '@/features/ventas/components/contenedor-filtros-fijos'
import { ListaDeudoresEstados } from '@/features/ventas/deudores/components/lista-deudores'
import { PanelFiltrosDeudores } from '@/features/ventas/deudores/components/panel-filtros-deudores'
import { ResumenResultadosDeudores } from '@/features/ventas/deudores/components/resumen-resultados-deudores'
import type { EstadoListaDeudores, ListaDeudoresProps } from '@/features/ventas/deudores/types/cuenta-corriente'

/** Cuantos deudores devolvio la ultima consulta; null mientras carga o si fallo. */
function contarResultados(estadoLista: EstadoListaDeudores) {
  if (estadoLista.tipo === 'con-deudores') return estadoLista.paginacion.totalRegistros
  if (estadoLista.tipo === 'sin-deudores' || estadoLista.tipo === 'sin-resultados') return 0
  return null
}

/** Pantalla Ventas > Deudores: quien debe, cuanto y para cuando. */
export function Deudores({
  filtros,
  estadoLista,
  onCambiarBusqueda,
  onCambiarProximoPago,
  onCambiarOrden,
  onInvertirSentido,
  onLimpiarFiltros,
  onCambiarPagina,
  onAbrirFicha,
  onReintentar,
}: ListaDeudoresProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-bloque">
      {/* Sin titulo visible: la pestana de la seccion ya dice donde estamos */}
      <h1 className="sr-only">Deudores</h1>

      {/* --- FILTROS (FIJOS AL HACER SCROLL) --- */}
      <ContenedorFiltrosFijos>
        <PanelFiltrosDeudores
          filtros={filtros}
          totalResultados={contarResultados(estadoLista)}
          onCambiarBusqueda={onCambiarBusqueda}
          onCambiarProximoPago={onCambiarProximoPago}
          onCambiarOrden={onCambiarOrden}
          onInvertirSentido={onInvertirSentido}
          onLimpiarFiltros={onLimpiarFiltros}
        />
      </ContenedorFiltrosFijos>

      {/* --- RESUMEN: CUANTOS DEUDORES, FILTROS APLICADOS Y LIMPIAR --- */}
      <ResumenResultadosDeudores
        filtros={filtros}
        estadoLista={estadoLista}
        onCambiarProximoPago={onCambiarProximoPago}
        onLimpiarFiltros={onLimpiarFiltros}
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
