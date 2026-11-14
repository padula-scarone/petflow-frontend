import { Dialog, DialogBody, DialogContent } from '@/components/ui/dialog'
import { AvisosRepobladoCambio } from '@/features/ventas/cambios-mercaderia/components/avisos-repoblado-cambio'
import { DialogoDescartarCambio } from '@/features/ventas/cambios-mercaderia/components/dialogo-descartar-cambio'
import { EncabezadoAltaCambio } from '@/features/ventas/cambios-mercaderia/components/encabezado-alta-cambio'
import { ExitoCambio } from '@/features/ventas/cambios-mercaderia/components/exito-cambio'
import { PasoArticulos } from '@/features/ventas/cambios-mercaderia/components/paso-articulos'
import { PasoMotivo } from '@/features/ventas/cambios-mercaderia/components/paso-motivo'
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
  sugerenciasEntregado,
  mediosPago,
  estadoCatalogo,
  estadoMediosPago,
  onReintentarCatalogo,
  onReintentarMediosPago,
  avisosRepoblado,
  resumenSaldo,
  validacion,
  estadoEnvio,
  confirmandoDescarte,
  acciones,
}: AltaCambioProps) {
  return (
    <>
      <Dialog open={abierto} onOpenChange={(estaAbierto) => !estaAbierto && acciones.onSolicitarCierre()}>
        <DialogContent
          className="sm:max-w-3xl"
          // Radix atiende Escape antes que el buscador: si el foco esta en uno con la lista abierta,
          // ese Escape cierra la lista y no el modal
          onEscapeKeyDown={(evento) => {
            if (evento.target instanceof Element && evento.target.closest('[data-buscador-abierto]')) {
              evento.preventDefault()
            }
          }}
        >
          {estadoEnvio.tipo === 'exito' ? (
            <ExitoCambio cambio={estadoEnvio.cambio} acciones={acciones} />
          ) : (
            <>
              <EncabezadoAltaCambio paso={paso} />
              <DialogBody>
                <AvisosRepobladoCambio avisos={avisosRepoblado} />
                {paso === 'MOTIVO' && <PasoMotivo borrador={borrador} acciones={acciones} />}
                {paso === 'VENTA_ORIGINAL' && (
                  <PasoVentaOriginal
                    borrador={borrador}
                    busquedaVenta={busquedaVenta}
                    estadoCatalogo={estadoCatalogo}
                    onReintentarCatalogo={onReintentarCatalogo}
                    acciones={acciones}
                  />
                )}
                {paso === 'ARTICULOS' && (
                  <PasoArticulos
                    borrador={borrador}
                    textoBusquedaDevuelto={textoBusquedaDevuelto}
                    textoBusquedaEntregado={textoBusquedaEntregado}
                    resultadosDevuelto={resultadosDevuelto}
                    resultadosEntregado={resultadosEntregado}
                    sugerenciasEntregado={sugerenciasEntregado}
                    estadoCatalogo={estadoCatalogo}
                    onReintentarCatalogo={onReintentarCatalogo}
                    resumenSaldo={resumenSaldo}
                    validacion={validacion}
                    acciones={acciones}
                  />
                )}
                {paso === 'COBRO' && (
                  <PasoCobro
                    borrador={borrador}
                    mediosPago={mediosPago}
                    estadoMediosPago={estadoMediosPago}
                    onReintentarMediosPago={onReintentarMediosPago}
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
