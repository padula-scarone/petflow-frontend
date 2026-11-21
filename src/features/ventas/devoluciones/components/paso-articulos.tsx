import { EstadoCatalogoProductos } from '@/features/ventas/components/estado-catalogo-productos'
import { FormularioArticuloDevuelto } from '@/features/ventas/devoluciones/components/formulario-articulo-devuelto'
import { FormularioArticuloEntregado } from '@/features/ventas/devoluciones/components/formulario-articulo-entregado'
import { ResumenVentaVinculada } from '@/features/ventas/devoluciones/components/resumen-venta-vinculada'
import { TarjetaSaldoDevolucion } from '@/features/ventas/devoluciones/components/tarjeta-saldo-devolucion'
import type { AltaDevolucionProps } from '@/features/ventas/devoluciones/types/devolucion'

/** Props del paso "Artículos". */
type PasoArticulosProps = Pick<
  AltaDevolucionProps,
  | 'borrador'
  | 'textoBusquedaDevuelto'
  | 'textoBusquedaEntregado'
  | 'resultadosDevuelto'
  | 'resultadosEntregado'
  | 'sugerenciasEntregado'
  | 'estadoCatalogo'
  | 'onReintentarCatalogo'
  | 'resumenSaldo'
  | 'validacion'
  | 'acciones'
>

/**
 * Paso 3: una sola columna y de a un articulo por vez, para no mostrar todo junto. Primero lo que devuelve el
 * cliente; recien cuando lo eligio aparece lo que se lleva, y cuando eligio los dos, el saldo en vivo.
 */
export function PasoArticulos({
  borrador,
  textoBusquedaDevuelto,
  textoBusquedaEntregado,
  resultadosDevuelto,
  resultadosEntregado,
  sugerenciasEntregado,
  estadoCatalogo,
  onReintentarCatalogo,
  resumenSaldo,
  validacion,
  acciones,
}: PasoArticulosProps) {
  const eligioDevuelto = borrador.articuloDevuelto !== null
  const eligioLosDos = eligioDevuelto && borrador.articuloEntregado !== null

  return (
    <div className="flex flex-col gap-bloque">
      {/* Mientras el catalogo no esta listo los buscadores no tienen de donde sacar productos */}
      {estadoCatalogo.fase !== 'listo' && (
        <EstadoCatalogoProductos estadoCatalogo={estadoCatalogo} onReintentar={onReintentarCatalogo} />
      )}

      {borrador.ventaVinculada && (
        <ResumenVentaVinculada
          venta={borrador.ventaVinculada}
          etiquetaQuitar="Quitar vínculo"
          onDesvincularVenta={acciones.onDesvincularVenta}
        />
      )}

      <FormularioArticuloDevuelto
        borrador={borrador}
        textoBusqueda={textoBusquedaDevuelto}
        resultadosBusqueda={resultadosDevuelto}
        erroresCampo={validacion.erroresCampo}
        acciones={acciones}
      />

      {eligioDevuelto && (
        <FormularioArticuloEntregado
          borrador={borrador}
          textoBusqueda={textoBusquedaEntregado}
          resultadosBusqueda={resultadosEntregado}
          sugerencias={sugerenciasEntregado}
          valorDevuelto={resumenSaldo.valorDevuelto}
          erroresCampo={validacion.erroresCampo}
          acciones={acciones}
        />
      )}

      {eligioLosDos && <TarjetaSaldoDevolucion resumen={resumenSaldo} />}
    </div>
  )
}
