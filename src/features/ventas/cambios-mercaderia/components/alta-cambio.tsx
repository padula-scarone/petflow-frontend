import { Dialog, DialogBody, DialogContent } from '@/components/ui/dialog'
import { DialogoDescartarCambio } from '@/features/ventas/cambios-mercaderia/components/dialogo-descartar-cambio'
import { EncabezadoAltaCambio } from '@/features/ventas/cambios-mercaderia/components/encabezado-alta-cambio'
import { ExitoCambio } from '@/features/ventas/cambios-mercaderia/components/exito-cambio'
import { PasoArticulos } from '@/features/ventas/cambios-mercaderia/components/paso-articulos'
import { PasoCobro } from '@/features/ventas/cambios-mercaderia/components/paso-cobro'
import { PasoVentaOriginal } from '@/features/ventas/cambios-mercaderia/components/paso-venta-original'
import { PieAltaCambio } from '@/features/ventas/cambios-mercaderia/components/pie-alta-cambio'
import type { AltaCambioProps } from '@/features/ventas/cambios-mercaderia/types/cambio'

/**
 * Modal de alta de un cambio. Pantalla completa en mobile y ventana centrada desde sm (el Dialog del
 * repo ya se comporta asi): con teclado en pantalla no queda nada tapado a medias. Foco atrapado y cierre
 * con Escape; si hay datos cargados, cerrar pide confirmar el descarte.
 */
export function AltaCambio({
  abierto,
  paso,
  borrador,
  busquedaVenta,
  textoBusquedaDevuelto,
  textoBusquedaEntregado,
  resultadosDevuelto,
  resultadosEntregado,
  mediosPago,
  resumenSaldo,
  validacion,
  estadoEnvio,
  confirmandoDescarte,
  acciones,
}: AltaCambioProps) {
  return (
    <>
      <Dialog open={abierto} onOpenChange={(estaAbierto) => !estaAbierto && acciones.onSolicitarCierre()}>
        <DialogContent className="sm:max-w-3xl">
          {estadoEnvio.tipo === 'exito' ? (
            <ExitoCambio cambio={estadoEnvio.cambio} acciones={acciones} />
          ) : (
            <>
              <EncabezadoAltaCambio paso={paso} />
              <DialogBody>
                {paso === 'VENTA_ORIGINAL' && (
                  <PasoVentaOriginal borrador={borrador} busquedaVenta={busquedaVenta} acciones={acciones} />
                )}
                {paso === 'ARTICULOS' && (
                  <PasoArticulos
                    borrador={borrador}
                    textoBusquedaDevuelto={textoBusquedaDevuelto}
                    textoBusquedaEntregado={textoBusquedaEntregado}
                    resultadosDevuelto={resultadosDevuelto}
                    resultadosEntregado={resultadosEntregado}
                    resumenSaldo={resumenSaldo}
                    validacion={validacion}
                    acciones={acciones}
                  />
                )}
                {paso === 'COBRO' && (
                  <PasoCobro
                    borrador={borrador}
                    mediosPago={mediosPago}
                    resumenSaldo={resumenSaldo}
                    validacion={validacion}
                    estadoEnvio={estadoEnvio}
                    acciones={acciones}
                  />
                )}
              </DialogBody>
              <PieAltaCambio
                paso={paso}
                borrador={borrador}
                resumenSaldo={resumenSaldo}
                validacion={validacion}
                estadoEnvio={estadoEnvio}
                acciones={acciones}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <DialogoDescartarCambio
        abierto={confirmandoDescarte}
        onConfirmar={acciones.onConfirmarDescarte}
        onCancelar={acciones.onCancelarDescarte}
      />
    </>
  )
}
