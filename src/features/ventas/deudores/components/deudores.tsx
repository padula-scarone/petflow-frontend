import { ListaDeudoresEstados } from '@/features/ventas/deudores/components/lista-deudores'
import { PanelFiltrosDeudores } from '@/features/ventas/deudores/components/panel-filtros-deudores'
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
      {/* Es la misma barra fija que la del Historial y Devoluciones; los comentarios de por que cada clase estan en
          historial-ventas.tsx: margenes negativos contra el padding del area con scroll y top que baja de la cabecera */}
      <div className="sticky top-[max(calc(var(--spacing-contorno)*-1),calc(var(--alto-cabecera,0px)-var(--spacing-contorno)*2))] z-20 -mx-contorno -mt-contorno bg-fondo-pagina px-contorno pt-contorno pb-interno transition-[top] duration-200 motion-reduce:transition-none">
        <PanelFiltrosDeudores
          filtros={filtros}
          totalResultados={contarResultados(estadoLista)}
          onCambiarBusqueda={onCambiarBusqueda}
          onCambiarProximoPago={onCambiarProximoPago}
          onCambiarOrden={onCambiarOrden}
          onInvertirSentido={onInvertirSentido}
          onLimpiarFiltros={onLimpiarFiltros}
        />
      </div>

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
