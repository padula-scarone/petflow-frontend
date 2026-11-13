import { FilterX, ReceiptText } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { EstadoCargandoLista } from '@/features/ventas/components/estado-cargando-lista'
import { EstadoErrorLista } from '@/features/ventas/components/estado-error-lista'
import { EstadoVacioLista } from '@/features/ventas/components/estado-vacio-lista'
import { PaginacionLista } from '@/features/ventas/components/paginacion-lista'
import { TablaVentasHistorial } from '@/features/ventas/components/tabla-ventas-historial'
import { TarjetaVentaHistorial } from '@/features/ventas/components/tarjeta-venta-historial'
import { RUTAS_REGISTRAR_VENTA } from '@/features/ventas/config/rutas-registrar-venta'
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
  if (estadoLista.tipo === 'cargando') return <EstadoCargandoLista textoAccesible="Cargando ventas" />
  if (estadoLista.tipo === 'error') {
    return (
      <EstadoErrorLista
        titulo="No se pudo cargar el historial"
        mensaje={estadoLista.mensaje}
        onReintentar={onReintentar}
      />
    )
  }
  // sin-ventas: todavia no hay ninguna. sin-resultados: hay ventas, pero los filtros no devuelven ninguna
  if (estadoLista.tipo === 'sin-ventas') {
    return (
      <EstadoVacioLista
        icono={ReceiptText}
        titulo="Todavía no hay ventas registradas"
        descripcion="Cuando registres una venta, la vas a ver acá."
        accion={
          <Button asChild className="h-11 px-6">
            <Link to={RUTAS_REGISTRAR_VENTA.carrito}>Registrar venta</Link>
          </Button>
        }
      />
    )
  }
  if (estadoLista.tipo === 'sin-resultados') {
    return (
      <EstadoVacioLista
        icono={FilterX}
        titulo="No encontramos ventas con estos filtros"
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
          <li key={fila.idVenta} className="min-w-0">
            <TarjetaVentaHistorial fila={fila} acciones={acciones} />
          </li>
        ))}
      </ul>

      {/* --- TABLA (DESDE XL) --- */}
      <div className="hidden xl:block">
        <TablaVentasHistorial filas={filas} acciones={acciones} />
      </div>

      <PaginacionLista paginacion={paginacion} onCambiarPagina={onCambiarPagina} />
    </div>
  )
}
