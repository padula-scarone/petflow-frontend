import { HandCoins } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { BuscadorProductos } from '@/features/ventas/components/buscador-productos'
import { EstadoCatalogoProductos } from '@/features/ventas/components/estado-catalogo-productos'
import { SelectorCanalVenta } from '@/features/ventas/components/selector-canal-venta'
import { TarjetaArticuloCarrito } from '@/features/ventas/components/tarjeta-articulo-carrito'
import type { RegistrarVentaCarritoProps } from '@/features/ventas/types/venta'

export function RegistrarVentaCarrito({
  estadoVenta,
  textoBusqueda,
  resultadosBusqueda,
  estadoCatalogo,
  onReintentarCatalogo,
  onBuscarProducto,
  onAgregarProducto,
  onCambiarCanal,
  onAumentarCantidad,
  onDisminuirCantidad,
  onCambiarPesoGranel,
  onCambiarUnidades,
  onEliminarArticulo,
  onContinuarACobro,
}: RegistrarVentaCarritoProps) {
  const { canalVenta, articulos, subtotal, algunArticuloSuperaStock } = estadoVenta
  const carritoVacio = articulos.length === 0

  return (
    // En celular y tablet: una columna (canal, productos y el cobro pegado abajo). Desde xl, igual que el cobro: los
    // productos a la izquierda y, a la derecha, el canal y el cobro. La fila 2 se estira (1fr) para que el canal y el
    // cobro queden juntos arriba y no se separen cuando la lista de productos crece
    <section className="flex min-h-full flex-col gap-bloque xl:grid xl:min-h-0 xl:grid-cols-[minmax(0,1fr)_20rem] xl:grid-rows-[auto_1fr] xl:items-start">
      {/* --- CANAL --- */}
      <div className="xl:col-start-2 xl:row-start-1">
        <SelectorCanalVenta canalVenta={canalVenta} onCambiarCanal={onCambiarCanal} />
      </div>

      {/* --- COLUMNA PRINCIPAL: BUSCADOR Y ARTICULOS --- */}
      {/* Desde xl ocupa la columna izquierda, a lo alto de las dos filas de la derecha (canal y cobro) */}
      <div className="flex min-w-0 flex-col gap-bloque xl:col-start-1 xl:row-span-2 xl:row-start-1">
        {/* --- BUSCADOR --- */}
        {/* Sin catalogo no hay nada que buscar: se muestra la carga o el error con reintento */}
        {estadoCatalogo.fase === 'listo' ? (
          <BuscadorProductos
            textoBusqueda={textoBusqueda}
            resultadosBusqueda={resultadosBusqueda}
            onBuscarProducto={onBuscarProducto}
            onAgregarProducto={onAgregarProducto}
          />
        ) : (
          <EstadoCatalogoProductos estadoCatalogo={estadoCatalogo} onReintentar={onReintentarCatalogo} />
        )}

        {/* --- LISTA DE PRODUCTOS --- */}
        <div className="flex flex-col gap-interno">
          <div className="flex items-center gap-2">
            <h2 className="text-titulo-seccion font-bold">Artículos agregados</h2>
            <Badge variant="outline" className="bg-fondo-tarjeta tabular-nums">
              {articulos.length}
            </Badge>
          </div>

          {carritoVacio ? (
            <p className="rounded-grande border border-dashed bg-fondo-tarjeta px-contorno py-10 text-center text-texto-suave">
              Todavía no agregaste artículos
            </p>
          ) : (
            <ul className="flex flex-col gap-interno">
              {articulos.map((articulo) => (
                <li key={articulo.idProducto} className="@container">
                  <TarjetaArticuloCarrito
                    articulo={articulo}
                    onAumentarCantidad={onAumentarCantidad}
                    onDisminuirCantidad={onDisminuirCantidad}
                    onCambiarPesoGranel={onCambiarPesoGranel}
                    onCambiarUnidades={onCambiarUnidades}
                    onEliminarArticulo={onEliminarArticulo}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* --- FOOTER COBRO --- */}
      {/* En mobile queda pegado al borde inferior del area con scroll; -bottom-contorno y los margenes negativos compensan el padding del contenedor.
          Desde xl es una tarjeta en la columna derecha, debajo del canal: el subtotal y el boton a todo el ancho */}
      <footer className="sticky -bottom-contorno z-10 mt-auto -mx-contorno -mb-contorno flex items-center justify-between gap-interno border-t bg-fondo-tarjeta p-contorno xl:static xl:col-start-2 xl:row-start-2 xl:mx-0 xl:mb-0 xl:mt-0 xl:flex-col xl:items-stretch xl:gap-bloque xl:rounded-extragrande xl:border">
        <p className="flex flex-col xl:flex-row xl:items-baseline xl:justify-between xl:gap-2">
          <span className="text-cuerpo text-texto-suave">Subtotal:</span>
          <span className="text-cifra-secundaria font-bold tabular-nums">
            {formatearMoneda(subtotal)}
          </span>
        </p>
        <Button
          type="button"
          variant="exito"
          size="lg"
          className="min-w-0 flex-1 px-4 tracking-wide sm:flex-none xl:w-full xl:flex-none"
          // Un articulo por encima del stock se corrige antes de cobrar: el back lo rechazaria igual
          disabled={carritoVacio || algunArticuloSuperaStock}
          onClick={onContinuarACobro}
        >
          COBRAR
          <HandCoins className="size-5 lg:size-6" />
        </Button>
      </footer>
    </section>
  )
}
