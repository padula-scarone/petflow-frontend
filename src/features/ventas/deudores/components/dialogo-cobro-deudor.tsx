import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatearMoneda, formatearMonedaConSigno } from '@/lib/formatear-moneda'
import { BotonConfirmarCobro } from '@/features/ventas/components/boton-confirmar-cobro'
import { EstadoCobertura } from '@/features/ventas/components/estado-cobertura'
import { EstadoMediosPago } from '@/features/ventas/components/estado-medios-pago'
import { PanelFormaPago } from '@/features/ventas/components/panel-forma-pago'
import { ReciboCobroDeudorContenido } from '@/features/ventas/deudores/components/recibo-cobro-deudor'
import type {
  ErrorCobroDeudor,
  FilaFiadoSeleccionable,
  ReciboCobroDeudor,
} from '@/features/ventas/deudores/types/cobro-deudor'
import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import type { PropiedadesCobroRegistrarVenta } from '@/features/ventas/types/cobro'

/** Props del dialogo para cobrar los fiados tildados de un deudor. */
interface DialogoCobroDeudorProps {
  deudor: Deudor
  filasACobrar: FilaFiadoSeleccionable[]
  /** Suma de lo que se abona a los fiados, antes de los ajustes de los medios. */
  totalACobrar: number
  /** El cobro de Registrar Venta, sin descuento manual ni fiado: de el salen los medios y su calculo. */
  propiedadesCobro: PropiedadesCobroRegistrarVenta
  enviando: boolean
  error: ErrorCobroDeudor | null
  /** Cuando existe, el cobro ya se hizo: se muestra el recibo. */
  recibo: ReciboCobroDeudor | null
  onConfirmarCobro: () => void
  onCerrar: () => void
}

/** Titulo del aviso de rechazo, segun por que el servidor no cobro. */
function describirTituloRechazo(error: ErrorCobroDeudor) {
  if (error.motivo === 'FIADO_NO_PENDIENTE') return 'Un fiado ya no está pendiente'
  if (error.motivo === 'MONTO_SUPERA_FALTANTE') return 'Un monto supera lo que falta'
  if (error.motivo === 'CAJA_CERRADA') return 'No hay una caja abierta'
  return 'No se pudo registrar el cobro'
}

/**
 * Cobro de los fiados tildados. Paso 1: elegir con que se paga, con el mismo panel de Registrar Venta pero sin
 * descuento manual ni Fiado. Paso 2: el recibo consolidado. Es todo o nada: si falla uno, no se cobra ninguno.
 */
export function DialogoCobroDeudor({
  deudor,
  filasACobrar,
  totalACobrar,
  propiedadesCobro,
  enviando,
  error,
  recibo,
  onConfirmarCobro,
  onCerrar,
}: DialogoCobroDeudorProps) {
  const { estadoCobro } = propiedadesCobro
  const { resumen, formaPago } = estadoCobro

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !enviando && onCerrar()}>
      <DialogContent aria-describedby="descripcion-cobro-deudor">
        {recibo ? (
          // --- PASO 2: COBRADO. EL RECIBO CONSOLIDADO ---
          <>
            <DialogTitle className="sr-only">Cobro registrado</DialogTitle>
            <DialogDescription id="descripcion-cobro-deudor" className="sr-only">
              Se cobraron {recibo.fiadosAbonados.length} fiados de {deudor.nombreCompleto}. Recibo {recibo.numeroRecibo}.
            </DialogDescription>
            <DialogBody className="gap-bloque pt-bloque">
              <ReciboCobroDeudorContenido recibo={recibo} />
            </DialogBody>
            <DialogFooter>
              <Button type="button" onClick={onCerrar}>
                Cerrar
              </Button>
            </DialogFooter>
          </>
        ) : (
          // --- PASO 1: ELEGIR COMO SE COBRA ---
          <>
            <DialogHeader>
              <DialogTitle>Cobrar fiados</DialogTitle>
              <DialogDescription id="descripcion-cobro-deudor">
                {deudor.nombreCompleto} · {filasACobrar.length} {filasACobrar.length === 1 ? 'fiado' : 'fiados'}
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              {/* --- LO QUE SE ABONA A CADA FIADO --- */}
              <section aria-label="Fiados a cobrar" className="flex flex-col gap-interno rounded-grande border bg-fondo-suave p-contorno">
                <ul className="flex flex-col gap-interno text-cuerpo">
                  {filasACobrar.map((fila) => (
                    <li key={fila.fiado.idVenta} className="flex justify-between gap-interno">
                      <span className="tabular-nums">{fila.fiado.numeroComprobante}</span>
                      <span className="font-medium tabular-nums">{formatearMoneda(fila.montoACobrar ?? 0)}</span>
                    </li>
                  ))}
                </ul>
                <p className="flex items-baseline justify-between gap-interno border-t pt-interno">
                  <span className="text-cuerpo text-texto-suave">Total a cobrar</span>
                  <span className="text-cifra-principal font-bold tabular-nums">{formatearMoneda(totalACobrar)}</span>
                </p>
              </section>

              <EstadoMediosPago
                estadoMediosPago={propiedadesCobro.estadoMediosPago}
                cantidadMedios={estadoCobro.mediosDisponibles.length}
                onReintentar={propiedadesCobro.onReintentarMediosPago}
              />

              {/* Sin descuento manual y sin la opcion de fiado: el SSOT no lo admite al cobrar */}
              <PanelFormaPago
                estadoCobro={estadoCobro}
                permiteFiado={false}
                onCambiarFormaPago={propiedadesCobro.onCambiarFormaPago}
                onSeleccionarMedioPago={propiedadesCobro.onSeleccionarMedioPago}
                onCambiarPagaCon={propiedadesCobro.onCambiarPagaCon}
                onAgregarLineaPago={propiedadesCobro.onAgregarLineaPago}
                onQuitarLineaPago={propiedadesCobro.onQuitarLineaPago}
                onCambiarMontoLinea={propiedadesCobro.onCambiarMontoLinea}
                onCambiarPagaConLinea={propiedadesCobro.onCambiarPagaConLinea}
                onCompletarConRestante={propiedadesCobro.onCompletarConRestante}
                onCambiarNombreClienteFiado={propiedadesCobro.onCambiarNombreClienteFiado}
              />

              {/* --- TOTAL ESTIMADO --- */}
              <section aria-label="Total estimado" className="flex flex-col gap-interno rounded-grande border p-contorno">
                <dl className="flex flex-col gap-interno text-cuerpo">
                  <div className="flex justify-between gap-interno">
                    <dt className="text-texto-suave">Total a cobrar</dt>
                    <dd className="font-medium tabular-nums">{formatearMoneda(totalACobrar)}</dd>
                  </div>
                  <div className="flex justify-between gap-interno">
                    <dt className="text-texto-suave">Descuento o recargo del medio de pago</dt>
                    <dd className="font-medium whitespace-nowrap tabular-nums">
                      {formatearMonedaConSigno(resumen.montoAjusteMediosPago)}
                    </dd>
                  </div>
                </dl>
                <p className="flex items-baseline justify-between gap-interno border-t pt-interno">
                  <span className="font-bold">Total estimado</span>
                  <span className="text-cifra-secundaria font-bold tabular-nums">{formatearMoneda(resumen.total)}</span>
                </p>
                <p className="text-auxiliar text-texto-suave">
                  Es un estimado: el total final lo calcula el servidor con los recargos y descuentos vigentes al
                  confirmar. El cobro necesita una caja abierta.
                </p>
                {formaPago === 'mixto' && (
                  <EstadoCobertura
                    faltaCubrir={resumen.faltaCubrir}
                    excedente={resumen.excedente}
                    onAjustarAutomaticamente={propiedadesCobro.onAjustarMontosAutomaticamente}
                    className="border-t pt-interno"
                  />
                )}
              </section>

              {/* --- RECHAZO DEL SERVIDOR (TODO O NADA) --- */}
              {error && (
                <Alert variant="destructive">
                  <TriangleAlert aria-hidden="true" />
                  <AlertTitle>{describirTituloRechazo(error)}</AlertTitle>
                  <AlertDescription>
                    <p>{error.mensaje}</p>
                  </AlertDescription>
                </Alert>
              )}

              {!estadoCobro.puedeConfirmar && estadoCobro.motivoNoConfirmable && (
                <p role="status" className="text-center text-cuerpo text-texto-suave">
                  {estadoCobro.motivoNoConfirmable}
                </p>
              )}
            </DialogBody>

            <DialogFooter className="sm:items-center">
              <Button type="button" variant="outline" className="bg-fondo-tarjeta" disabled={enviando} onClick={onCerrar}>
                {error && !error.reintentable ? 'Volver a la cuenta' : 'Cancelar'}
              </Button>
              {/* Si un fiado ya no esta pendiente o el monto no entra, no hay nada que reintentar: se vuelve a la cuenta */}
              {(error === null || error.reintentable) && (
                <BotonConfirmarCobro
                  formaPago={formaPago}
                  habilitado={estadoCobro.puedeConfirmar && !enviando}
                  enviando={enviando}
                  onConfirmarCobro={onConfirmarCobro}
                />
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
