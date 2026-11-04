import { ArrowRight } from 'lucide-react'
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
    // El padding inferior en mobile evita que el pie fijo tape el ultimo articulo
    <section className="flex flex-col gap-6 pb-28 lg:pb-0">
      {/* --- HEADER Y CONFIGURACION --- */}
      <header className="flex flex-col gap-4 rounded-lg border bg-card p-4">
        <h1 className="text-xl font-bold">Registrar venta</h1>
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
          <Badge variant="secondary" className="tabular-nums">
            {articulos.length}
          </Badge>
        </div>

        {carritoVacio ? (
          <p className="rounded-lg border border-dashed bg-card px-4 py-10 text-center text-muted-foreground">
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
      {/* bottom-16: queda sobre la barra inferior de modulos en mobile */}
      <footer className="fixed inset-x-0 bottom-16 z-10 flex items-center justify-between gap-4 border-t bg-card p-4 lg:static lg:justify-end lg:gap-6 lg:border-0 lg:bg-transparent lg:p-0">
        <p className="flex flex-col lg:flex-row lg:items-baseline lg:gap-2">
          <span className="text-sm text-muted-foreground">Subtotal:</span>
          <span className="text-xl font-bold tabular-nums">
            {formatearMoneda(subtotal)}
          </span>
        </p>
        <Button
          type="button"
          className="h-11 px-6"
          disabled={carritoVacio}
          onClick={onContinuarACobro}
        >
          Cobrar
          <ArrowRight />
        </Button>
      </footer>
    </section>
  )
}
