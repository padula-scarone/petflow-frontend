import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TarjetaVentaVinculable } from '@/features/ventas/cambios-mercaderia/components/tarjeta-venta-vinculable'
import type { PropiedadesBusquedaVenta } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { EstadoErrorLista } from '@/features/ventas/components/estado-error-lista'
import { PaginacionLista } from '@/features/ventas/components/paginacion-lista'

/** Props de los resultados de la busqueda de venta. */
interface ListaVentasVinculablesProps {
  propiedades: PropiedadesBusquedaVenta
}

/** Cargando, error, sin resultados o la lista de ventas COMPLETADA que se pueden vincular. */
export function ListaVentasVinculables({ propiedades }: ListaVentasVinculablesProps) {
  const { estado, idVentaVinculando, errorVinculacion, onVincularVenta, onCambiarPaginaBusqueda, onReintentarBusqueda, onLimpiarFiltros } =
    propiedades

  if (estado.tipo === 'cargando') {
    return (
      <div role="status" aria-busy="true" className="flex flex-col gap-2">
        <span className="sr-only">Buscando ventas</span>
        {[0, 1, 2].map((indice) => (
          <Card key={indice} className="gap-2 p-3 shadow-none">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-24" />
          </Card>
        ))}
      </div>
    )
  }

  if (estado.tipo === 'error') {
    return (
      <EstadoErrorLista titulo="No se pudo buscar" mensaje={estado.mensaje} onReintentar={onReintentarBusqueda} />
    )
  }

  if (estado.tipo === 'sin-resultados') {
    return (
      <Card className="items-center gap-3 px-4 py-8 text-center shadow-none">
        <div className="flex max-w-sm flex-col gap-1">
          <h3 className="text-base font-bold">No encontramos ventas con estos filtros</h3>
          {/* La regla que explica por que falta una venta: solo se vinculan las completadas */}
          <p className="text-sm text-texto-suave">
            Solo se pueden vincular ventas completadas: un fiado primero se cobra o se anula. Probá con otro filtro, o
            cargá el cambio sin vincular.
          </p>
        </div>
        <Button type="button" variant="outline" className="h-11 bg-fondo-tarjeta px-6" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {errorVinculacion && (
        <Alert variant="destructive">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>No se pudo vincular</AlertTitle>
          <AlertDescription>
            <p>{errorVinculacion.mensaje}</p>
          </AlertDescription>
        </Alert>
      )}
      <ul aria-label="Ventas que se pueden vincular" className="flex flex-col gap-2">
        {estado.ventas.map((venta) => (
          <li key={venta.idVenta} className="min-w-0">
            <TarjetaVentaVinculable
              venta={venta}
              idVentaVinculando={idVentaVinculando}
              onVincularVenta={onVincularVenta}
            />
          </li>
        ))}
      </ul>
      <PaginacionLista paginacion={estado.paginacion} onCambiarPagina={onCambiarPaginaBusqueda} />
    </div>
  )
}
