import type { ReactNode } from 'react'
import { Trash2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { cn } from '@/lib/utils'
import { CampoCantidadUnidades } from '@/features/ventas/components/campo-cantidad-unidades'
import { CampoPesoGranel } from '@/features/ventas/components/campo-peso-granel'
import { ImagenProducto } from '@/features/ventas/components/imagen-producto'
import { NombreProducto } from '@/features/ventas/components/nombre-producto'
import { formatearCantidad } from '@/features/ventas/utils/formatear-cantidad'
import { superaStockDisponible } from '@/features/ventas/utils/superar-stock'
import type { ArticuloCarrito } from '@/features/ventas/types/venta'

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
        'flex w-fit items-center gap-2 rounded-mediano bg-amber-50 px-3 py-2 text-cuerpo font-medium text-amber-800',
        className,
      )}
    >
      <TriangleAlert aria-hidden="true" className="size-4 shrink-0" />
      Supera el stock disponible
    </p>
  )
}

/** Props de un dato de la cuenta del articulo. */
interface DatoCuentaProps {
  etiqueta: string
  /** Lugar del dato en la tarjeta: ancho, alineacion y margenes. */
  className?: string
  /** Estilo del renglon del valor: alto y alineacion. */
  claseValor?: string
  children: ReactNode
}

/**
 * Un dato de la cuenta (precio o subtotal): la etiqueta arriba y el valor pegado debajo. Nunca van separados a los
 * extremos: con mas ancho, etiqueta y valor seguirian lejos y se leerian como cosas distintas.
 */
function DatoCuenta({ etiqueta, className, claseValor, children }: DatoCuentaProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className="text-auxiliar whitespace-nowrap text-texto-suave">{etiqueta}</span>
      <div className={cn('flex items-center', claseValor)}>{children}</div>
    </div>
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
    // En mobile se apila en dos bloques, separados por bloque: el producto arriba y la cuenta (precio, cantidad y
    // subtotal) debajo. Desde xl todo va en una sola fila
    <Card className="flex flex-col gap-bloque p-contorno shadow-none xl:flex-row xl:items-center">
      {/* --- PRODUCTO: IMAGEN, DATOS, ELIMINAR Y AVISO DE STOCK --- */}
      <div className="flex flex-col gap-interno xl:contents">
        <div className="flex items-start gap-interno xl:contents">
          {/* 80 px: el alto de cuatro renglones de texto (nombre en dos, categoria y stock), asi la foto y los datos
              terminan a la misma altura */}
          <ImagenProducto urlImagen={articulo.urlImagen} className="size-20 xl:size-26" />

          <div className="min-w-0 flex-1">
            {/* Nada se corta con puntos suspensivos: lo que no entra en un renglon pasa al siguiente. La presentacion
                va con el nombre y no con la categoria: son datos distintos */}
            <p className="font-bold tabular-nums">
              <NombreProducto nombre={articulo.nombreProducto} formato={articulo.formato} />
            </p>
            <p className="text-cuerpo text-texto-suave">{articulo.categoria}</p>
            {/* El stock es un dato del producto, no de la cuenta: va con el producto y siempre a la vista, asi se sabe
                cuanto se puede agregar antes de que salte el aviso */}
            <p className="text-cuerpo text-texto-suave tabular-nums">
              Stock: {formatearCantidad(articulo.stockDisponible, articulo.formato)}
            </p>
            {/* Solo en PC: ahi el bloque del nombre es ancho. En mobile el aviso va en su propia fila, abajo */}
            {excedeStock && <AvisoSuperaStock className="mt-2 hidden xl:flex" />}
          </div>

          {/* En una esquina, lejos de los botones de la cantidad: un toque de mas no borra el articulo. En PC pasa
              al final de la fila */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Eliminar ${articulo.nombreProducto}`}
            className="-mt-2 -mr-2 shrink-0 text-slate-500 xl:order-last xl:m-0"
            onClick={() => onEliminarArticulo(articulo.idProducto)}
          >
            <Trash2 />
          </Button>
        </div>

        {/* --- AVISO DE STOCK (MOBILE Y TABLET) --- */}
        {/* En una fila propia entra en un renglon; dentro del bloque del nombre se partia en dos */}
        {excedeStock && <AvisoSuperaStock className="self-start xl:hidden" />}
      </div>

      {/* --- CUENTA: PRECIO, CANTIDAD Y SUBTOTAL --- */}
      {/* Se leen como una cuenta: precio, cantidad y el resultado. En mobile el precio y la cantidad comparten fila
          (si no entran, la cantidad baja a su propia fila a todo el ancho) y el subtotal cierra debajo. Desde sm
          los tres van en una fila. Desde xl siguen siendo un solo bloque, centrado en la tarjeta, para que sus
          etiquetas queden a la misma altura aunque el campo de cantidad sea mas alto (el "1 kg" del granel) */}
      <div className="flex flex-wrap items-start gap-x-bloque gap-y-interno xl:flex-nowrap">
        {/* Desde xl el precio es una columna de cifras: va a la derecha, con su etiqueta */}
        <DatoCuenta
          etiqueta={esGranel ? 'Precio por kg' : 'Precio unidad'}
          className="xl:min-w-28 xl:items-end"
          claseValor="h-control xl:justify-end"
        >
          <span className="tabular-nums">{formatearMoneda(articulo.precioUnitario)}</span>
        </DatoCuenta>

        <div className="flex min-w-36 flex-1 flex-col gap-1 sm:flex-none">
          <span aria-hidden="true" className="text-auxiliar text-texto-suave">
            Cantidad
          </span>
          {esGranel ? (
            <CampoPesoGranel
              nombreProducto={articulo.nombreProducto}
              gramos={Math.round(articulo.cantidad * 1000)}
              onCambiarGramos={(gramos) => onCambiarPesoGranel(articulo.idProducto, gramos)}
              onAumentar={() => onAumentarCantidad(articulo.idProducto)}
              onDisminuir={() => onDisminuirCantidad(articulo.idProducto)}
            />
          ) : (
            <CampoCantidadUnidades
              nombreProducto={articulo.nombreProducto}
              unidades={articulo.cantidad}
              onCambiarUnidades={(unidades) => onCambiarUnidades(articulo.idProducto, unidades)}
              onAumentar={() => onAumentarCantidad(articulo.idProducto)}
              onDisminuir={() => onDisminuirCantidad(articulo.idProducto)}
            />
          )}
        </div>

        {/* El resultado de la cuenta. En mobile cierra la tarjeta, separado por una linea, como el total de un
            ticket; desde sm queda a la derecha de la fila */}
        <DatoCuenta
          etiqueta="Subtotal producto"
          className="min-w-20 basis-full items-end border-t pt-interno sm:ml-auto sm:basis-auto sm:border-t-0 sm:pt-0 xl:ml-0 xl:min-w-28"
          claseValor="justify-end sm:h-control"
        >
          <span className="text-cifra-secundaria font-bold tabular-nums">{formatearMoneda(articulo.montoTotal)}</span>
        </DatoCuenta>
      </div>
    </Card>
  )
}
