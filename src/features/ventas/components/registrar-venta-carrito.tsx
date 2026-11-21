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
  onCambiarUnidades,
  onEliminarArticulo,
  avisosRepoblado,
  onCerrarAvisosRepoblado,
  onContinuarACobro,
}: RegistrarVentaCarritoProps) {
  const { canalVenta, tipoEntrega, articulos, subtotal, algunArticuloSuperaStock } = estadoVenta
  const carritoVacio = articulos.length === 0

  return (
    <section className="flex min-h-full flex-col gap-bloque">
      {/* --- HEADER Y CONFIGURACION --- */}
      <header className="flex flex-col gap-bloque rounded-grande border bg-fondo-tarjeta p-contorno">
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
              className="mt-2 bg-fondo-tarjeta text-texto-principal"
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
              <li key={articulo.idProducto}>
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

      {/* --- FOOTER COBRO --- */}
      {/* En mobile queda pegado al borde inferior del area con scroll; -bottom-contorno y los margenes negativos compensan el padding del contenedor */}
      <footer className="sticky -bottom-contorno z-10 mt-auto xl:mt-0 -mx-contorno -mb-contorno flex items-center justify-between gap-interno border-t bg-fondo-tarjeta p-contorno xl:static xl:mx-0 xl:mb-0 xl:justify-end xl:gap-bloque xl:border-0 xl:bg-transparent xl:p-0">
        <p className="flex flex-col xl:flex-row xl:items-baseline xl:gap-2">
          <span className="text-cuerpo text-texto-suave">Subtotal:</span>
          <span className="text-cifra-secundaria font-bold tabular-nums">
            {formatearMoneda(subtotal)}
          </span>
        </p>
        <Button
          type="button"
          variant="exito"
          size="lg"
          className="min-w-0 flex-1 px-4 tracking-wide sm:flex-none xl:min-w-56"
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
