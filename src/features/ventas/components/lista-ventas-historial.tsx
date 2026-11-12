import { EstadoCargandoHistorial } from '@/features/ventas/components/estado-cargando-historial'
import { EstadoErrorHistorial } from '@/features/ventas/components/estado-error-historial'
import { EstadoVacioHistorial } from '@/features/ventas/components/estado-vacio-historial'
import { PaginacionHistorial } from '@/features/ventas/components/paginacion-historial'
import { TablaVentasHistorial } from '@/features/ventas/components/tabla-ventas-historial'
import { TarjetaVentaHistorial } from '@/features/ventas/components/tarjeta-venta-historial'
import type {
  EstadoListaHistorial,
  PropiedadesAccionesVenta,
} from '@/features/ventas/types/historial'

/** Props de la lista de ventas: muestra el estado que corresponda (cargando, vacio, error o datos). */
interface ListaVentasHistorialProps {
  estadoLista: EstadoListaHistorial
  acciones: PropiedadesAccionesVenta
  onCambiarPagina: (pagina: number) => void
  onReintentar: () => void
  onLimpiarFiltros: () => void
}

export function ListaVentasHistorial({
  estadoLista,
  acciones,
  onCambiarPagina,
  onReintentar,
  onLimpiarFiltros,
}: ListaVentasHistorialProps) {
  if (estadoLista.tipo === 'cargando') return <EstadoCargandoHistorial />
  if (estadoLista.tipo === 'error') {
    return <EstadoErrorHistorial mensaje={estadoLista.mensaje} onReintentar={onReintentar} />
  }
  if (estadoLista.tipo === 'sin-ventas' || estadoLista.tipo === 'sin-resultados') {
    return <EstadoVacioHistorial variante={estadoLista.tipo} onLimpiarFiltros={onLimpiarFiltros} />
  }

  const { filas, paginacion } = estadoLista

  return (
    <div className="flex flex-col gap-4">
      {/* --- TARJETAS (HASTA XL) --- */}
      <ul className="grid gap-3 md:grid-cols-2 xl:hidden">
        {filas.map((fila) => (
          <li key={fila.idVenta}>
            <TarjetaVentaHistorial fila={fila} acciones={acciones} />
          </li>
        ))}
      </ul>

      {/* --- TABLA (DESDE XL) --- */}
      <div className="hidden xl:block">
        <TablaVentasHistorial filas={filas} acciones={acciones} />
      </div>

      <PaginacionHistorial paginacion={paginacion} onCambiarPagina={onCambiarPagina} />
    </div>
  )
}
