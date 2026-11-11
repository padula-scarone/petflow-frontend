import { formatearMoneda } from '@/lib/formatear-moneda'
import { formatearCantidad } from '@/features/ventas/utils/formatear-cantidad'
import type { DetalleComprobante } from '@/features/ventas/types/comprobante'

/** Props del detalle de productos del comprobante. */
interface DetalleProductosComprobanteProps {
  detalles: DetalleComprobante[]
}

// Mobile: nombre arriba; cantidad, precio y subtotal en la linea de abajo.
// Desde sm: tabla de cuatro columnas.
const CLASE_COLUMNAS =
  'grid grid-cols-[auto_1fr_auto] gap-x-3 sm:grid-cols-[minmax(0,1fr)_6rem_8rem_8rem]'

export function DetalleProductosComprobante({ detalles }: DetalleProductosComprobanteProps) {
  return (
    <section aria-labelledby="titulo-detalle-productos" className="flex flex-col gap-1">
      <h2 id="titulo-detalle-productos" className="text-base font-bold">
        Detalle de productos
      </h2>

      {/* --- ENCABEZADO DE COLUMNAS (DESDE SM) --- */}
      <div
        aria-hidden="true"
        className={`${CLASE_COLUMNAS} hidden border-b pb-2 text-sm text-texto-suave sm:grid`}
      >
        <span>Producto</span>
        <span className="text-right">Cantidad</span>
        <span className="text-right">Precio unitario</span>
        <span className="text-right">Subtotal</span>
      </div>

      {/* --- RENGLONES --- */}
      <ul className="flex flex-col divide-y">
        {detalles.map((detalle) => (
          <li
            key={detalle.idProducto}
            className={`${CLASE_COLUMNAS} items-baseline gap-y-0.5 py-3`}
          >
            <p className="col-span-3 font-medium tabular-nums sm:col-span-1">{detalle.nombreProducto}</p>
            <p className="text-sm tabular-nums sm:text-right sm:text-base">
              {formatearCantidad(detalle.cantidad, detalle.formato)}
            </p>
            <p className="text-sm text-texto-suave tabular-nums before:content-['×_'] sm:text-right sm:text-base sm:text-texto-principal sm:before:content-none">
              {formatearMoneda(detalle.precioUnitario)}
            </p>
            <p className="text-right font-bold tabular-nums">{formatearMoneda(detalle.subtotal)}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
