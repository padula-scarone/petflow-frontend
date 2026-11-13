import { FormularioArticuloDevuelto } from '@/features/ventas/cambios-mercaderia/components/formulario-articulo-devuelto'
import { FormularioArticuloEntregado } from '@/features/ventas/cambios-mercaderia/components/formulario-articulo-entregado'
import { ResumenVentaVinculada } from '@/features/ventas/cambios-mercaderia/components/resumen-venta-vinculada'
import { TarjetaSaldoCambio } from '@/features/ventas/cambios-mercaderia/components/tarjeta-saldo-cambio'
import type { AltaCambioProps } from '@/features/ventas/cambios-mercaderia/types/cambio'

/** Props del paso "Artículos". */
type PasoArticulosProps = Pick<
  AltaCambioProps,
  | 'borrador'
  | 'textoBusquedaDevuelto'
  | 'textoBusquedaEntregado'
  | 'resultadosDevuelto'
  | 'resultadosEntregado'
  | 'resumenSaldo'
  | 'validacion'
  | 'acciones'
>

/**
 * Paso 2: lo que devuelve y lo que se lleva el cliente, con el saldo en vivo debajo. Dos columnas desde md;
 * en mobile, una debajo de la otra.
 */
export function PasoArticulos({
  borrador,
  textoBusquedaDevuelto,
  textoBusquedaEntregado,
  resultadosDevuelto,
  resultadosEntregado,
  resumenSaldo,
  validacion,
  acciones,
}: PasoArticulosProps) {
  return (
    <div className="flex flex-col gap-4">
      {borrador.ventaVinculada && (
        <ResumenVentaVinculada
          venta={borrador.ventaVinculada}
          etiquetaQuitar="Quitar vínculo"
          onDesvincularVenta={acciones.onDesvincularVenta}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <FormularioArticuloDevuelto
          borrador={borrador}
          textoBusqueda={textoBusquedaDevuelto}
          resultadosBusqueda={resultadosDevuelto}
          erroresCampo={validacion.erroresCampo}
          acciones={acciones}
        />
        <FormularioArticuloEntregado
          borrador={borrador}
          textoBusqueda={textoBusquedaEntregado}
          resultadosBusqueda={resultadosEntregado}
          erroresCampo={validacion.erroresCampo}
          acciones={acciones}
        />
      </div>

      <TarjetaSaldoCambio resumen={resumenSaldo} />
    </div>
  )
}
