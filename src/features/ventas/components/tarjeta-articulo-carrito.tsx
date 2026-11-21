import { Trash2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { cn } from '@/lib/utils'
import { CampoCantidadUnidades } from '@/features/ventas/components/campo-cantidad-unidades'
import { CampoPesoGranel } from '@/features/ventas/components/campo-peso-granel'
import { ImagenProducto } from '@/features/ventas/components/imagen-producto'
import { formatearCantidad } from '@/features/ventas/utils/formatear-cantidad'
import { superaStockDisponible } from '@/features/ventas/utils/superar-stock'
import type { ArticuloCarrito } from '@/features/ventas/types/venta'

/**
 * Lugar del campo de cantidad: en mobile baja a su propia fila, debajo de stock, precio y subtotal. Ocupa todo el
 * ancho menos el del boton de eliminar (44 px) y su separacion (12 px), que lo acompana en esa fila.
 */
const CLASES_CANTIDAD = 'order-4 basis-[calc(100%-3.5rem)] sm:order-0 sm:basis-auto'

/**
 * Aviso de que la cantidad supera el stock. Se dibuja en dos lugares segun el ancho de pantalla y solo uno se ve
 * (el otro queda en display none, que tambien lo saca del lector de pantalla), asi que se anuncia una sola vez.
 * Todo el estilo vive aca: quien lo usa solo decide donde va, para que se vea igual en PC y en celular.
 * @param className Solo ubicacion: margenes, alineacion y en que tamano de pantalla se muestra.
 */
function AvisoSuperaStock({ className }: { className: string }) {
  return (
    <p
      role="alert"
      className={cn(
        'flex w-fit items-center gap-2 rounded-mediano bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800',
        className,
      )}
    >
      <TriangleAlert aria-hidden="true" className="size-4 shrink-0" />
      Supera el stock disponible
    </p>
  )
}

/** Props de la tarjeta de un articulo del carrito. */
interface TarjetaArticuloCarritoProps {
  articulo: ArticuloCarrito
  onAumentarCantidad: (idProducto: string) => void
  onDisminuirCantidad: (idProducto: string) => void
  onCambiarPesoGranel: (idProducto: string, gramos: number) => void
  onCambiarUnidades: (idProducto: string, unidades: number) => void
  onEliminarArticulo: (idProducto: string) => void
}

export function TarjetaArticuloCarrito({
  articulo,
  onAumentarCantidad,
  onDisminuirCantidad,
  onCambiarPesoGranel,
  onCambiarUnidades,
  onEliminarArticulo,
}: TarjetaArticuloCarritoProps) {
  const excedeStock = superaStockDisponible(articulo)
  // Un producto a granel se vende por kilo: las etiquetas lo dicen para que no se confunda con una unidad
  const esGranel = articulo.formato === 'granel'

  return (
    // En mobile se apila en dos filas; desde lg los bloques pasan a una sola fila
    <Card className="flex flex-col gap-3 p-3 shadow-none xl:flex-row xl:items-center xl:gap-6 xl:p-4">
      {/* --- IMAGEN Y DATOS --- */}
      <div className="flex items-start gap-3 xl:contents">
        <ImagenProducto
          urlImagen={articulo.urlImagen}
          className="size-16 xl:size-26"
        />

        <div className="min-w-0 flex-1">
          {/* Nada se corta con puntos suspensivos: lo que no entra en un renglon pasa al siguiente */}
          <p className="font-bold tabular-nums">{articulo.nombreProducto}</p>
          <p className="mt-1 text-sm text-texto-suave">
            {articulo.categoria} · {esGranel ? 'Granel' : 'Unidad'}
          </p>
          {/* Solo en PC: ahi el bloque del nombre es ancho. En mobile el aviso va en su propia fila, abajo */}
          {excedeStock && <AvisoSuperaStock className="mt-2 hidden xl:flex" />}
        </div>
      </div>

      {/* --- AVISO DE STOCK (MOBILE Y TABLET) --- */}
      {/* En una fila propia entra en un renglon; dentro del bloque del nombre se partia en dos */}
      {excedeStock && <AvisoSuperaStock className="self-start xl:hidden" />}

      {/* --- PRECIO, CANTIDAD Y TOTAL --- */}
      {/* En mobile, una fila con stock, precio y subtotal repartidos de punta a punta, y la cantidad debajo a todo
          el ancho. Es el mismo orden que en PC. Desde sm todo vuelve a ir en una fila (el orden del DOM) */}
      <div className="flex flex-wrap justify-between gap-x-3 gap-y-3 sm:items-center sm:justify-start sm:gap-y-2 xl:contents">
        {/* El stock siempre a la vista: asi se sabe cuanto se puede agregar antes de que salte el aviso */}
        {/* Desde xl stock y precio son columnas de cifras: van a la derecha, con su etiqueta */}
        <div className="order-1 flex flex-col sm:order-0 xl:w-24 xl:items-end">
          <span className="text-xs whitespace-nowrap text-texto-suave">Stock</span>
          <span className="tabular-nums">
            {formatearCantidad(articulo.stockDisponible, articulo.formato)}
          </span>
        </div>

        <div className="order-2 flex flex-col sm:order-0 xl:w-28 xl:items-end">
          <span className="text-xs whitespace-nowrap text-texto-suave">
            {esGranel ? 'Precio por kg' : 'Precio unidad'}
          </span>
          <span className="tabular-nums">
            {formatearMoneda(articulo.precioUnitario)}
          </span>
        </div>

        {esGranel ? (
          <CampoPesoGranel
            className={CLASES_CANTIDAD}
            nombreProducto={articulo.nombreProducto}
            gramos={Math.round(articulo.cantidad * 1000)}
            onCambiarGramos={(gramos) => onCambiarPesoGranel(articulo.idProducto, gramos)}
            onAumentar={() => onAumentarCantidad(articulo.idProducto)}
            onDisminuir={() => onDisminuirCantidad(articulo.idProducto)}
          />
        ) : (
          <CampoCantidadUnidades
            className={CLASES_CANTIDAD}
            nombreProducto={articulo.nombreProducto}
            unidades={articulo.cantidad}
            onCambiarUnidades={(unidades) => onCambiarUnidades(articulo.idProducto, unidades)}
            onAumentar={() => onAumentarCantidad(articulo.idProducto)}
            onDisminuir={() => onDisminuirCantidad(articulo.idProducto)}
          />
        )}

        {/* Etiqueta arriba, como la del precio: sin ella el monto no dice a que corresponde */}
        <div className="order-3 flex min-w-20 flex-col items-end sm:order-0 sm:ml-auto xl:ml-0 xl:w-28">
          <span className="text-xs whitespace-nowrap text-texto-suave">Subtotal producto</span>
          <span className="font-bold tabular-nums">{formatearMoneda(articulo.montoTotal)}</span>
        </div>

        {/* --- ELIMINAR --- */}
        {/* En mobile acompana a la cantidad, asi el bloque del nombre usa todo el ancho junto a la imagen. Va
            ultimo en el DOM: en sm y xl queda al final de la fila, lejos de los botones de la cantidad */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Eliminar ${articulo.nombreProducto}`}
          className="order-5 size-11 shrink-0 self-start text-slate-500 sm:order-0 sm:self-auto"
          onClick={() => onEliminarArticulo(articulo.idProducto)}
        >
          <Trash2 />
        </Button>
      </div>
    </Card>
  )
}
