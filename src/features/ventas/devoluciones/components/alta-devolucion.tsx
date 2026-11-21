import { Dialog, DialogBody, DialogContent } from '@/components/ui/dialog'
import { AvisosRepobladoDevolucion } from '@/features/ventas/devoluciones/components/avisos-repoblado-devolucion'
import { DialogoDescartarDevolucion } from '@/features/ventas/devoluciones/components/dialogo-descartar-devolucion'
import { EncabezadoAltaDevolucion } from '@/features/ventas/devoluciones/components/encabezado-alta-devolucion'
import { ExitoDevolucion } from '@/features/ventas/devoluciones/components/exito-devolucion'
import { PasoArticulos } from '@/features/ventas/devoluciones/components/paso-articulos'
import { PasoMotivo } from '@/features/ventas/devoluciones/components/paso-motivo'
import { PasoCobro } from '@/features/ventas/devoluciones/components/paso-cobro'
import { PasoVentaOriginal } from '@/features/ventas/devoluciones/components/paso-venta-original'
import { PieAltaDevolucion } from '@/features/ventas/devoluciones/components/pie-alta-devolucion'
import type { AltaDevolucionProps } from '@/features/ventas/devoluciones/types/devolucion'

/**
 * Modal de alta de una devolución. Pantalla completa en mobile y ventana centrada desde sm (el Dialog del
 * repo ya se comporta asi): con teclado en pantalla no queda nada tapado a medias. Foco atrapado y cierre
 * con Escape; si hay datos cargados, cerrar pide confirmar el descarte.
 */
export function AltaDevolucion({
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
}: AltaDevolucionProps) {
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
            <ExitoDevolucion devolucion={estadoEnvio.devolucion} acciones={acciones} />
          ) : (
            <>
              <EncabezadoAltaDevolucion paso={paso} />
              <DialogBody>
                <AvisosRepobladoDevolucion avisos={avisosRepoblado} />
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
              <PieAltaDevolucion
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

      <DialogoDescartarDevolucion
        abierto={confirmandoDescarte}
        onConfirmar={acciones.onConfirmarDescarte}
        onCancelar={acciones.onCancelarDescarte}
      />
    </>
  )
}
