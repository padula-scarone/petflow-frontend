import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CampoCantidad } from '@/features/ventas/cambios-mercaderia/components/campo-cantidad'
import { InterruptorBolsaAbierta } from '@/features/ventas/cambios-mercaderia/components/interruptor-bolsa-abierta'
import { SelectorItemVenta } from '@/features/ventas/cambios-mercaderia/components/selector-item-venta'
import type {
  AccionesAltaCambio,
  BorradorCambio,
  ProductoCatalogoCambio,
  ValidacionCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import { describirCantidadArticulo } from '@/features/ventas/cambios-mercaderia/utils/describir-articulo-cambio'
import { BuscadorProductos } from '@/features/ventas/components/buscador-productos'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props del formulario del articulo que devuelve el cliente. */
interface FormularioArticuloDevueltoProps {
  borrador: BorradorCambio
  textoBusqueda: string
  resultadosBusqueda: ProductoCatalogoCambio[]
  erroresCampo: ValidacionCambio['erroresCampo']
  acciones: AccionesAltaCambio
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
    <section aria-labelledby="titulo-articulo-devuelto" className="flex min-w-0 flex-col gap-3">
      <h2 id="titulo-articulo-devuelto" className="text-base font-bold">
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
        <div className="flex flex-col gap-3 rounded-grande border bg-fondo-seleccion/40 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 font-medium wrap-break-word">{articulo.nombreProducto}</p>
            <div className="-my-2 -mr-2 flex shrink-0 items-center gap-1">
              <p className="text-sm tabular-nums text-texto-suave">
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
                  className="size-11"
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
              <p className="text-sm text-texto-suave">Se devuelve 1 bolsa abierta.</p>
              <CampoCantidad
                idCampo="peso-devuelto"
                etiqueta="Peso devuelto (kg)"
                valor={articulo.pesoDevueltoKg}
                admiteDecimales
                unidad="kg"
                error={erroresCampo.pesoDevuelto}
                ayuda={`Pesaje real de lo que quedó en la bolsa. Máximo ${describirCantidadArticulo(articulo.opcionBolsaAbierta.pesoNominalKg, 'GRANEL')}, el peso de la bolsa cerrada. Se valúa a ${formatearMoneda(articulo.opcionBolsaAbierta.precioPorKg)} el kg.`}
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
