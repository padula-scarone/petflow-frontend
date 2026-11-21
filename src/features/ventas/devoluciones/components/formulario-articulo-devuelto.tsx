import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CampoCantidad } from '@/features/ventas/devoluciones/components/campo-cantidad'
import { InterruptorBolsaAbierta } from '@/features/ventas/devoluciones/components/interruptor-bolsa-abierta'
import { SelectorItemVenta } from '@/features/ventas/devoluciones/components/selector-item-venta'
import type {
  AccionesAltaDevolucion,
  BorradorDevolucion,
  ProductoCatalogoDevolucion,
  ValidacionDevolucion,
} from '@/features/ventas/devoluciones/types/devolucion'
import { describirCantidadArticulo } from '@/features/ventas/devoluciones/utils/describir-articulo-devolucion'
import { BuscadorProductos } from '@/features/ventas/components/buscador-productos'
import { NombreProducto } from '@/features/ventas/components/nombre-producto'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props del formulario del articulo que devuelve el cliente. */
interface FormularioArticuloDevueltoProps {
  borrador: BorradorDevolucion
  textoBusqueda: string
  resultadosBusqueda: ProductoCatalogoDevolucion[]
  erroresCampo: ValidacionDevolucion['erroresCampo']
  acciones: AccionesAltaDevolucion
}

/**
 * Articulo devuelto (entra). Con venta vinculada se elige entre sus renglones, al precio que se pago; sin
 * venta se busca en el catalogo, al precio actual. Con "Bolsa abierta" se pide el peso real devuelto.
 */
export function FormularioArticuloDevuelto({
  borrador,
  textoBusqueda,
  resultadosBusqueda,
  erroresCampo,
  acciones,
}: FormularioArticuloDevueltoProps) {
  const { ventaVinculada, articuloDevuelto: articulo } = borrador

  return (
    <section aria-labelledby="titulo-articulo-devuelto" className="flex min-w-0 flex-col gap-interno">
      <h2 id="titulo-articulo-devuelto" className="text-titulo-seccion font-bold">
        Artículo que devuelve
      </h2>

      {/* --- ELEGIR EL ARTICULO: ENTRE LOS DE LA VENTA O EN EL CATALOGO --- */}
      {ventaVinculada ? (
        <SelectorItemVenta
          venta={ventaVinculada}
          idProductoSeleccionado={articulo?.idProducto ?? null}
          onSeleccionarArticulo={acciones.onSeleccionarArticuloVenta}
        />
      ) : (
        <BuscadorProductos
          textoBusqueda={textoBusqueda}
          resultadosBusqueda={resultadosBusqueda}
          placeholder="Buscar el artículo que devuelve"
          etiquetaAccesible="Buscar el artículo que devuelve"
          modoResultados="en-linea"
          onBuscarProducto={acciones.onBuscarProductoDevuelto}
          onAgregarProducto={acciones.onSeleccionarProductoDevuelto}
        />
      )}

      {/* --- ARTICULO ELEGIDO: CANTIDAD, BOLSA ABIERTA Y PESO --- */}
      {articulo && (
        <div className="flex flex-col gap-interno rounded-grande border bg-fondo-seleccion/40 p-contorno">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 font-medium wrap-break-word">
              <NombreProducto nombre={articulo.nombreProducto} formato={articulo.formatoVenta} />
            </p>
            <div className="-my-2 -mr-2 flex shrink-0 items-center gap-1">
              <p className="text-cuerpo tabular-nums text-texto-suave">
                {formatearMoneda(articulo.precioUnitario)}
                {articulo.formatoVenta === 'GRANEL' ? '/kg' : ''}
                <span className="sr-only">{articulo.origen === 'VENTA' ? ', precio pagado' : ', precio actual'}</span>
              </p>
              {/* Con venta el articulo se cambia eligiendo otro renglon; del catalogo, se quita y se vuelve a buscar */}
              {articulo.origen === 'CATALOGO' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Quitar ${articulo.nombreProducto}`}
                  className="size-control"
                  onClick={acciones.onQuitarProductoDevuelto}
                >
                  <X />
                </Button>
              )}
            </div>
          </div>

          {articulo.opcionBolsaAbierta && (
            <InterruptorBolsaAbierta
              opcion={articulo.opcionBolsaAbierta}
              activado={articulo.esBolsaAbierta}
              onCambiar={acciones.onCambiarBolsaAbierta}
            />
          )}

          {articulo.esBolsaAbierta && articulo.opcionBolsaAbierta ? (
            <>
              <p className="text-cuerpo text-texto-suave">Se devuelve 1 bolsa abierta.</p>
              <CampoCantidad
                idCampo="peso-devuelto"
                etiqueta="Peso devuelto (kg)"
                valor={articulo.pesoDevueltoKg}
                admiteDecimales
                unidad="kg"
                error={erroresCampo.pesoDevuelto}
                ayuda={`Peso real de lo que quedó en la bolsa (máximo ${describirCantidadArticulo(articulo.opcionBolsaAbierta.pesoNominalKg, 'GRANEL')}). Se valúa a ${formatearMoneda(articulo.opcionBolsaAbierta.precioPorKg)} el kg: precio de la bolsa dividido su peso.`}
                onCambiar={acciones.onCambiarPesoDevuelto}
              />
            </>
          ) : (
            <CampoCantidad
              idCampo="cantidad-devuelta"
              etiqueta={articulo.formatoVenta === 'GRANEL' ? 'Cantidad devuelta (kg)' : 'Cantidad devuelta (u)'}
              valor={articulo.cantidad}
              admiteDecimales={articulo.formatoVenta === 'GRANEL'}
              unidad={articulo.formatoVenta === 'GRANEL' ? 'kg' : 'u'}
              error={erroresCampo.cantidadDevuelta}
              ayuda={
                articulo.cantidadMaximaDisponible === null
                  ? undefined
                  : `Máximo disponible: ${describirCantidadArticulo(articulo.cantidadMaximaDisponible, articulo.formatoVenta)} (ya devuelto: ${describirCantidadArticulo(articulo.cantidadYaDevuelta, articulo.formatoVenta)}).`
              }
              onCambiar={acciones.onCambiarCantidadDevuelta}
            />
          )}
        </div>
      )}
    </section>
  )
}
