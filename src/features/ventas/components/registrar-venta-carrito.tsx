import { HandCoins } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { BuscadorProductos } from '@/features/ventas/components/buscador-productos'
import { SelectorConfiguracionVenta } from '@/features/ventas/components/selector-configuracion-venta'
import { TarjetaArticuloCarrito } from '@/features/ventas/components/tarjeta-articulo-carrito'
import type { RegistrarVentaCarritoProps } from '@/features/ventas/types/venta'

export function RegistrarVentaCarrito({
  estadoVenta,
  textoBusqueda,
  resultadosBusqueda,
  onBuscarProducto,
  onAgregarProducto,
  onCambiarCanal,
  onCambiarEntrega,
  onAumentarCantidad,
  onDisminuirCantidad,
  onEliminarArticulo,
  onContinuarACobro,
}: RegistrarVentaCarritoProps) {
  const { canalVenta, tipoEntrega, articulos, subtotal } = estadoVenta
  const carritoVacio = articulos.length === 0

  return (
    <section className="flex flex-col gap-6">
      {/* --- HEADER Y CONFIGURACION --- */}
      <header className="flex flex-col gap-4 rounded-grande border bg-fondo-tarjeta p-4">
        <SelectorConfiguracionVenta
          canalVenta={canalVenta}
          tipoEntrega={tipoEntrega}
          onCambiarCanal={onCambiarCanal}
          onCambiarEntrega={onCambiarEntrega}
        />
      </header>

      {/* --- BUSCADOR --- */}
      <BuscadorProductos
        textoBusqueda={textoBusqueda}
        resultadosBusqueda={resultadosBusqueda}
        onBuscarProducto={onBuscarProducto}
        onAgregarProducto={onAgregarProducto}
      />

      {/* --- LISTA DE PRODUCTOS --- */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">Artículos agregados</h2>
          <Badge variant="outline" className="bg-fondo-tarjeta tabular-nums">
            {articulos.length}
          </Badge>
        </div>

        {carritoVacio ? (
          <p className="rounded-grande border border-dashed bg-fondo-tarjeta px-4 py-10 text-center text-texto-suave">
            Todavía no agregaste artículos
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {articulos.map((articulo) => (
              <li key={articulo.idProducto}>
                <TarjetaArticuloCarrito
                  articulo={articulo}
                  onAumentarCantidad={onAumentarCantidad}
                  onDisminuirCantidad={onDisminuirCantidad}
                  onEliminarArticulo={onEliminarArticulo}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- FOOTER COBRO --- */}
      {/* En mobile queda pegado al borde inferior del area con scroll; -bottom-4 y los margenes negativos compensan el padding del contenedor */}
      <footer className="sticky -bottom-4 z-10 -mx-4 -mb-4 flex items-center justify-between gap-3 border-t bg-fondo-tarjeta p-4 lg:static lg:mx-0 lg:mb-0 lg:justify-end lg:gap-6 lg:border-0 lg:bg-transparent lg:p-0">
        <p className="flex flex-col lg:flex-row lg:items-baseline lg:gap-2">
          <span className="text-sm text-texto-suave">Subtotal:</span>
          <span className="text-xl font-bold tabular-nums lg:text-2xl">
            {formatearMoneda(subtotal)}
          </span>
        </p>
        <Button
          type="button"
          variant="exito"
          className="h-12 min-w-0 flex-1 px-5 text-base sm:px-8 font-bold tracking-wide shadow-md sm:flex-none lg:h-14 lg:min-w-56 lg:text-lg"
          disabled={carritoVacio}
          onClick={onContinuarACobro}
        >
          COBRAR
          <HandCoins className="size-5 lg:size-6" />
        </Button>
      </footer>
    </section>
  )
}
