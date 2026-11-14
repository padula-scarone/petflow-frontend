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
import { Skeleton } from '@/components/ui/skeleton'
import { formatearMoneda, formatearMonedaConSigno } from '@/lib/formatear-moneda'
import { BotonConfirmarCobro } from '@/features/ventas/components/boton-confirmar-cobro'
import { BotonesEnvioComprobante } from '@/features/ventas/components/botones-envio-comprobante'
import { EncabezadoExitoVenta } from '@/features/ventas/components/encabezado-exito-venta'
import { EstadoCobertura } from '@/features/ventas/components/estado-cobertura'
import { EstadoErrorLista } from '@/features/ventas/components/estado-error-lista'
import { EstadoMediosPago } from '@/features/ventas/components/estado-medios-pago'
import { PanelFormaPago } from '@/features/ventas/components/panel-forma-pago'
import type { CobroFiadoProps } from '@/features/ventas/types/historial'

export function DialogoCobroFiado({
  fila,
  estadoImporte,
  onReintentarImporte,
  importeAdeudado,
  estadoMediosPago,
  onReintentarMediosPago,
  propiedadesCobro,
  enviando,
  error,
  recibo,
  onConfirmarCobro,
  onCerrar,
  onVerRecibo,
  onActualizarListado,
}: CobroFiadoProps) {
  const { estadoCobro } = propiedadesCobro
  const { resumen, formaPago } = estadoCobro

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !enviando && onCerrar()}>
      <DialogContent>
        {/* --- PASO 2: COBRADO. SE OFRECE VER O ENVIAR EL RECIBO --- */}
        {recibo ? (
          <>
            <DialogTitle className="sr-only">Fiado cobrado</DialogTitle>
            <DialogDescription className="sr-only">
              El fiado de la venta {fila.numeroComprobante} se cobró y pasó a Completada.
            </DialogDescription>
            <DialogBody className="gap-5 pt-6">
              <EncabezadoExitoVenta estado="completada" titulo="Fiado cobrado" />
              <dl className="flex flex-col gap-2">
                <div className="flex justify-between gap-3">
                  <dt className="text-texto-suave">Comprobante</dt>
                  <dd className="font-medium tabular-nums">{fila.numeroComprobante}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-texto-suave">Cliente</dt>
                  <dd className="truncate font-medium">{fila.clienteReferencia}</dd>
                </div>
                {recibo.vuelto !== null && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-texto-suave">Vuelto</dt>
                    <dd className="font-medium tabular-nums">{formatearMoneda(recibo.vuelto)}</dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-3 border-t pt-3">
                  <dt className="text-lg font-bold">Total cobrado</dt>
                  <dd className="text-3xl font-bold tabular-nums">
                    {formatearMoneda(recibo.montoTotalCobrado)}
                  </dd>
                </div>
              </dl>
              {/* Sin comprobante (el pedido del detalle fallo) no hay enlaces; "Ver recibo" lo vuelve a pedir */}
              {recibo.enlaceWhatsApp !== null && recibo.enlaceMail !== null && (
                <div className="flex gap-2">
                  <BotonesEnvioComprobante
                    enlaceWhatsApp={recibo.enlaceWhatsApp}
                    enlaceMail={recibo.enlaceMail}
                    variante="compacta"
                  />
                </div>
              )}
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" className="h-11 px-6" onClick={onCerrar}>
                Cerrar
              </Button>
              <Button type="button" className="h-11 px-6" onClick={onVerRecibo}>
                Ver recibo
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* --- PASO 1: ELEGIR COMO SE COBRA --- */}
            <DialogHeader>
              <DialogTitle>Cobrar fiado</DialogTitle>
              <DialogDescription className="tabular-nums">
                {fila.numeroComprobante} · {fila.clienteReferencia}
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              {/* --- CARGA DEL IMPORTE: SALE DEL DETALLE DE LA VENTA --- */}
              {estadoImporte.fase === 'cargando' && (
                <div role="status" aria-busy="true" className="flex flex-col gap-4">
                  <span className="sr-only">Cargando los datos de la venta</span>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              )}

              {estadoImporte.fase === 'error' && (
                <EstadoErrorLista
                  titulo="No se pudo preparar el cobro"
                  mensaje={estadoImporte.mensajeError ?? ''}
                  onReintentar={onReintentarImporte}
                />
              )}

              {estadoImporte.fase === 'listo' && (
                <>
                  <div className="rounded-grande border bg-fondo-suave p-4">
                    <p className="text-sm text-texto-suave">Importe adeudado</p>
                    <p className="text-3xl font-bold tabular-nums">{formatearMoneda(importeAdeudado)}</p>
                  </div>

                  <EstadoMediosPago
                    estadoMediosPago={estadoMediosPago}
                    cantidadMedios={estadoCobro.mediosDisponibles.length}
                    onReintentar={onReintentarMediosPago}
                  />

                  {/* Sin descuento manual y sin la opcion de fiado: el SSOT no lo admite al cobrar un fiado */}
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
                  <section aria-label="Total estimado" className="flex flex-col gap-3 rounded-grande border p-4">
                    <dl className="flex flex-col gap-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt className="text-texto-suave">Importe adeudado</dt>
                        <dd className="font-medium tabular-nums">{formatearMoneda(importeAdeudado)}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-texto-suave">Descuento o recargo del medio de pago</dt>
                        <dd className="font-medium whitespace-nowrap tabular-nums">
                          {formatearMonedaConSigno(resumen.montoAjusteMediosPago)}
                        </dd>
                      </div>
                    </dl>
                    <p className="flex items-baseline justify-between gap-3 border-t pt-3">
                      <span className="font-bold">Total estimado</span>
                      <span className="text-2xl font-bold tabular-nums">{formatearMoneda(resumen.total)}</span>
                    </p>
                    <p className="text-xs text-texto-suave">
                      Es un estimado: el total final lo calcula el servidor con los recargos y descuentos
                      vigentes al confirmar.
                    </p>
                    {formaPago === 'mixto' && (
                      <EstadoCobertura
                        faltaCubrir={resumen.faltaCubrir}
                        excedente={resumen.excedente}
                        onAjustarAutomaticamente={propiedadesCobro.onAjustarMontosAutomaticamente}
                        className="border-t pt-3"
                      />
                    )}
                  </section>

                  {/* --- RECHAZO DEL SERVIDOR --- */}
                  {error && (
                    <Alert variant="destructive">
                      <TriangleAlert aria-hidden="true" />
                      <AlertTitle>
                        {error.estadoHttp === 404
                          ? 'La venta ya no existe'
                          : error.incierto
                            ? 'No pudimos confirmar el resultado'
                            : 'No se pudo cobrar el fiado'}
                      </AlertTitle>
                      <AlertDescription>
                        <p>{error.mensaje}</p>
                      </AlertDescription>
                    </Alert>
                  )}

                  {!estadoCobro.puedeConfirmar && estadoCobro.motivoNoConfirmable && (
                    <p role="status" className="text-center text-sm text-texto-suave">
                      {estadoCobro.motivoNoConfirmable}
                    </p>
                  )}
                </>
              )}
            </DialogBody>

            <DialogFooter className="sm:items-center">
              {error ? (
                <Button type="button" variant="outline" className="h-11 px-6" onClick={onActualizarListado}>
                  Actualizar listado
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-6"
                  disabled={enviando}
                  onClick={onCerrar}
                >
                  Cancelar
                </Button>
              )}
              {/* Si la venta ya no existe o la resolvio otra persona, no hay nada que cobrar; el resto se puede reintentar */}
              {estadoImporte.fase === 'listo' && (error === null || error.reintentable) && (
                <BotonConfirmarCobro
                  formaPago={formaPago}
                  habilitado={estadoCobro.puedeConfirmar && !enviando}
                  onConfirmarCobro={onConfirmarCobro}
                  className="sm:px-10"
                />
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
