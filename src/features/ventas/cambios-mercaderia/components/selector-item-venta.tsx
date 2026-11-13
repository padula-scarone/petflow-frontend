import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { VentaVinculada } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { calcularCantidadDisponible } from '@/features/ventas/cambios-mercaderia/utils/crear-articulos-cambio'
import { describirCantidadArticulo } from '@/features/ventas/cambios-mercaderia/utils/describir-articulo-cambio'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { cn } from '@/lib/utils'

/** Props de la lista de renglones de la venta vinculada. */
interface SelectorItemVentaProps {
  venta: VentaVinculada
  idProductoSeleccionado: number | null
  onSeleccionarArticulo: (idProducto: number) => void
}

/**
 * Los renglones de la venta, para elegir cual devuelve el cliente. Cada uno muestra lo vendido, lo que ya
 * se devolvio en cambios anteriores y lo que todavia se puede devolver, con el precio que se pago.
 * Un renglon sin nada disponible queda deshabilitado y dice por que.
 */
export function SelectorItemVenta({ venta, idProductoSeleccionado, onSeleccionarArticulo }: SelectorItemVentaProps) {
  return (
    <RadioGroup
      aria-label="Artículo que devuelve, entre los de la venta"
      value={idProductoSeleccionado === null ? '' : String(idProductoSeleccionado)}
      onValueChange={(valor) => onSeleccionarArticulo(Number(valor))}
    >
      {venta.items.map((item) => {
        const disponible = calcularCantidadDisponible(item)
        const agotado = disponible <= 0
        return (
          <label
            key={item.idProducto}
            className={cn(
              'flex min-h-11 cursor-pointer items-start gap-3 rounded-grande border bg-fondo-tarjeta px-3 py-3 text-sm has-[[data-state=checked]]:border-texto-principal has-[[data-state=checked]]:bg-fondo-seleccion',
              agotado && 'cursor-not-allowed opacity-70',
            )}
          >
            <RadioGroupItem value={String(item.idProducto)} disabled={agotado} className="mt-0.5" />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="flex items-start justify-between gap-3">
                <span className="font-medium wrap-break-word">{item.nombreProducto}</span>
                <span className="shrink-0 tabular-nums">{formatearMoneda(item.precioUnitario)}</span>
              </span>
              <span className="text-xs text-texto-suave tabular-nums">
                Vendido: {describirCantidadArticulo(item.cantidad, item.formatoVenta)} · Ya devuelto:{' '}
                {describirCantidadArticulo(item.cantidadYaDevuelta, item.formatoVenta)}
              </span>
              <span className={cn('text-xs tabular-nums', agotado ? 'text-peligro' : 'text-texto-suave')}>
                {agotado
                  ? 'Ya se devolvió todo lo que se vendió'
                  : `Disponible para devolver: ${describirCantidadArticulo(disponible, item.formatoVenta)}`}
              </span>
            </span>
          </label>
        )
      })}
    </RadioGroup>
  )
}
