import { HandCoins, Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { BuscadorProductos } from '@/features/ventas/components/buscador-productos'
import { EstadoCatalogoProductos } from '@/features/ventas/components/estado-catalogo-productos'
import { SelectorConfiguracionVenta } from '@/features/ventas/components/selector-configuracion-venta'
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
  onCambiarEntrega,
  onAumentarCantidad,
  onDisminuirCantidad,
  onCambiarPesoGranel,
  onEliminarArticulo,
  avisosRepoblado,
  onCerrarAvisosRepoblado,
  onContinuarACobro,
}: RegistrarVentaCarritoProps) {
  const { canalVenta, tipoEntrega, articulos, subtotal } = estadoVenta
  const carritoVacio = articulos.length === 0

  return (
    <section className="flex min-h-full flex-col gap-6">
      {/* --- HEADER Y CONFIGURACION --- */}
      <header className="flex flex-col gap-4 rounded-grande border bg-fondo-tarjeta p-4">
        <SelectorConfiguracionVenta
          canalVenta={canalVenta}
          tipoEntrega={tipoEntrega}
          onCambiarCanal={onCambiarCanal}
          onCambiarEntrega={onCambiarEntrega}
        />
      </header>

      {/* --- AVISOS DE UNA VENTA EDITADA: LO QUE NO SE PUDO VOLVER A CARGAR --- */}
      {avisosRepoblado.length > 0 && (
        <Alert role="status">
          <Info aria-hidden="true" />
          <AlertTitle>Revisá la venta antes de cobrar</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {avisosRepoblado.map((aviso) => (
                <li key={aviso}>{aviso}</li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              className="mt-2 h-11 bg-fondo-tarjeta px-6 text-texto-principal"
              onClick={onCerrarAvisosRepoblado}
            >
              Entendido
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
                  onCambiarPesoGranel={onCambiarPesoGranel}
                  onEliminarArticulo={onEliminarArticulo}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- FOOTER COBRO --- */}
      {/* En mobile queda pegado al borde inferior del area con scroll; -bottom-4 y los margenes negativos compensan el padding del contenedor */}
      <footer className="sticky -bottom-4 z-10 mt-auto xl:mt-0 -mx-4 -mb-4 flex items-center justify-between gap-3 border-t bg-fondo-tarjeta p-4 xl:static xl:mx-0 xl:mb-0 xl:justify-end xl:gap-6 xl:border-0 xl:bg-transparent xl:p-0">
        <p className="flex flex-col xl:flex-row xl:items-baseline xl:gap-2">
          <span className="text-sm text-texto-suave">Subtotal:</span>
          <span className="text-xl font-bold tabular-nums xl:text-2xl">
            {formatearMoneda(subtotal)}
          </span>
        </p>
        <Button
          type="button"
          variant="exito"
          className="h-12 min-w-0 flex-1 px-5 text-base sm:px-8 font-bold tracking-wide shadow-md sm:flex-none xl:h-14 xl:min-w-56 xl:text-lg"
          disabled={carritoVacio}
          onClick={onContinuarACobro}
        >
          COBRAR
          <HandCoins className="size-5 xl:size-6" />
        </Button>
      </footer>
    </section>
  )
}
