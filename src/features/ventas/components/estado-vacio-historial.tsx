import { Link } from 'react-router'
import { FilterX, ReceiptText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RUTAS_REGISTRAR_VENTA } from '@/features/ventas/config/rutas-registrar-venta'

/** Props del estado vacio del historial. */
interface EstadoVacioHistorialProps {
  /**
   * sin-ventas: todavia no hay ninguna venta registrada.
   * sin-resultados: hay ventas, pero los filtros activos no devuelven ninguna.
   */
  variante: 'sin-ventas' | 'sin-resultados'
  onLimpiarFiltros: () => void
}

export function EstadoVacioHistorial({ variante, onLimpiarFiltros }: EstadoVacioHistorialProps) {
  const sinResultados = variante === 'sin-resultados'
  const Icono = sinResultados ? FilterX : ReceiptText

  return (
    <Card className="items-center gap-4 px-4 py-12 text-center shadow-none">
      <span className="flex size-14 items-center justify-center rounded-full bg-fondo-suave text-texto-suave">
        <Icono aria-hidden="true" className="size-7" />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <h2 className="text-lg font-bold">
          {sinResultados ? 'No encontramos ventas con estos filtros' : 'Todavía no hay ventas registradas'}
        </h2>
        <p className="text-texto-suave">
          {sinResultados
            ? 'Probá con otro rango de fechas o quitá algún filtro.'
            : 'Cuando registres una venta, la vas a ver acá.'}
        </p>
      </div>
      {sinResultados ? (
        <Button type="button" variant="outline" className="h-11 bg-fondo-tarjeta px-6" onClick={onLimpiarFiltros}>
          Limpiar filtros
        </Button>
      ) : (
        <Button asChild className="h-11 px-6">
          <Link to={RUTAS_REGISTRAR_VENTA.carrito}>Registrar venta</Link>
        </Button>
      )}
    </Card>
  )
}
