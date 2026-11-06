import { Minus, Plus, Trash2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { ImagenProducto } from '@/features/ventas/components/imagen-producto'
import type { ArticuloCarrito } from '@/features/ventas/types/venta'

/** Props de la tarjeta de un articulo del carrito. */
interface TarjetaArticuloCarritoProps {
  articulo: ArticuloCarrito
  onAumentarCantidad: (idProducto: string) => void
  onDisminuirCantidad: (idProducto: string) => void
  onEliminarArticulo: (idProducto: string) => void
}

export function TarjetaArticuloCarrito({
  articulo,
  onAumentarCantidad,
  onDisminuirCantidad,
  onEliminarArticulo,
}: TarjetaArticuloCarritoProps) {
  const excedeStock = articulo.cantidad > articulo.stockDisponible

  return (
    // En mobile se apila en dos filas; desde lg los bloques pasan a una sola fila
    <Card className="flex flex-col gap-3 p-3 shadow-none lg:flex-row lg:items-center lg:gap-6 lg:p-4">
      {/* --- IMAGEN Y DATOS --- */}
      <div className="flex items-start gap-3 lg:contents">
        <ImagenProducto
          urlImagen={articulo.urlImagen}
          className="size-16 lg:size-26"
        />

        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-bold">{articulo.nombreProducto}</p>
          <p className="text-sm text-texto-suave">
            {articulo.categoria} · {articulo.formato === 'granel' ? 'Granel' : 'Unidad'}
          </p>
          {excedeStock && (
            <p
              role="alert"
              className="mt-1 flex items-center gap-1 text-sm font-medium text-amber-700"
            >
              <TriangleAlert aria-hidden="true" className="size-4 shrink-0" />
              <span className="tabular-nums">
                Supera el stock disponible ({articulo.stockDisponible})
              </span>
            </p>
          )}
        </div>

        {/* --- ELIMINAR --- */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Eliminar ${articulo.nombreProducto}`}
          className="size-11 shrink-0 text-slate-500 lg:order-last lg:size-9"
          onClick={() => onEliminarArticulo(articulo.idProducto)}
        >
          <Trash2 />
        </Button>
      </div>

      {/* --- PRECIO, CANTIDAD Y TOTAL --- */}
      {/* En pantallas angostas el total baja a su propia linea en lugar de desbordar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 lg:contents">
        <div className="flex flex-col lg:w-28">
          <span className="text-xs whitespace-nowrap text-texto-suave">Precio unidad</span>
          <span className="tabular-nums">
            {formatearMoneda(articulo.precioUnitario)}
          </span>
        </div>

        <div className="flex items-center rounded-grande border">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Disminuir cantidad de ${articulo.nombreProducto}`}
            className="size-11 lg:size-9"
            disabled={articulo.cantidad <= 1}
            onClick={() => onDisminuirCantidad(articulo.idProducto)}
          >
            <Minus />
          </Button>
          <span
            aria-live="polite"
            className="min-w-8 text-center font-medium tabular-nums"
          >
            {articulo.cantidad}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Aumentar cantidad de ${articulo.nombreProducto}`}
            className="size-11 lg:size-9"
            onClick={() => onAumentarCantidad(articulo.idProducto)}
          >
            <Plus />
          </Button>
        </div>

        <span className="ml-auto min-w-20 text-right font-bold tabular-nums lg:ml-0 lg:w-28">
          {formatearMoneda(articulo.montoTotal)}
        </span>
      </div>
    </Card>
  )
}
