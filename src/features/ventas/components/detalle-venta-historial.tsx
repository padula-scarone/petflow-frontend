import { Ban, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
import { formatearFechaHora } from '@/lib/formatear-fecha-hora'
import { AccionesVentaHistorial } from '@/features/ventas/components/acciones-venta-historial'
import { AjustesComprobante } from '@/features/ventas/components/ajustes-comprobante'
import { BotonesEnvioComprobante } from '@/features/ventas/components/botones-envio-comprobante'
import { DetalleProductosComprobante } from '@/features/ventas/components/detalle-productos-comprobante'
import { AvisoVentanaVenta } from '@/features/ventas/components/aviso-ventana-venta'
import { BotonCobrarFiado } from '@/features/ventas/components/boton-cobrar-fiado'
import { InsigniaEstadoVenta } from '@/features/ventas/components/insignia-estado-venta'
import { PagosComprobante } from '@/features/ventas/components/pagos-comprobante'
import { TotalesComprobante } from '@/features/ventas/components/totales-comprobante'
import type {
  EstadoDetalleVenta,
  PropiedadesAccionesVenta,
} from '@/features/ventas/types/historial'
import {
  construirEnlaceMail,
  construirEnlaceWhatsApp,
} from '@/features/ventas/utils/construir-enlaces-comprobante'
import { convertirVentaAComprobante } from '@/features/ventas/utils/convertir-venta-a-comprobante'
import { describirEntrega, describirOrigen } from '@/features/ventas/utils/describir-origen-entrega'
import { describirMotivo } from '@/features/ventas/utils/motivos-venta'

/** Props de la ventana con el detalle de una venta. */
interface DetalleVentaHistorialProps {
  /** null mientras el ventana esta cerrada. */
  detalle: EstadoDetalleVenta | null
  acciones: PropiedadesAccionesVenta
  onCerrar: () => void
  onReintentar: () => void
}

export function DetalleVentaHistorial({
  detalle,
  acciones,
  onCerrar,
  onReintentar,
}: DetalleVentaHistorialProps) {
  return (
    <Dialog open={detalle !== null} onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="sm:max-w-2xl">
        {detalle?.tipo === 'cargando' && (
          <>
            <DialogHeader>
              <DialogTitle>Detalle de la venta</DialogTitle>
              <DialogDescription>Cargando los datos…</DialogDescription>
            </DialogHeader>
            <DialogBody role="status" aria-busy="true">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-24 w-full" />
            </DialogBody>
          </>
        )}

        {detalle?.tipo === 'error' && (
          <>
            <DialogHeader>
              <DialogTitle>Detalle de la venta</DialogTitle>
              <DialogDescription>No se pudo mostrar la venta.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Alert variant="destructive" className="items-center">
                <TriangleAlert aria-hidden="true" />
                <AlertTitle>No se pudo cargar el detalle</AlertTitle>
                <AlertDescription>
                  <p>{detalle.mensaje}</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2 h-11 bg-fondo-tarjeta px-6 text-texto-principal"
                    onClick={onReintentar}
                  >
                    Reintentar
                  </Button>
                </AlertDescription>
              </Alert>
            </DialogBody>
          </>
        )}

        {detalle?.tipo === 'listo' && (() => {
          const { venta, fila } = detalle
          const comprobante = convertirVentaAComprobante(venta)
          const anulada = venta.estado === 'ANULADA'
          const anuladaSinPagos = anulada && venta.pagos.length === 0

          return (
            <>
              <DialogBody>
                {/* --- ENCABEZADO: VA DENTRO DEL SCROLL --- */}
                {/* Se mueve con el contenido en lugar de quedar fijo y ocupar espacio. pr-10: no pisa la X, que si es fija */}
                <div className="flex flex-col gap-1 pr-10">
                  <DialogDescription>Comprobante</DialogDescription>
                  <DialogTitle className="text-xl tabular-nums">{venta.numeroComprobante}</DialogTitle>
                  <div className="pt-1">
                    <InsigniaEstadoVenta estado={venta.estado} />
                  </div>
                </div>

                {anulada && (
                  <Alert role="status">
                    <Ban aria-hidden="true" />
                    <AlertTitle>Venta anulada</AlertTitle>
                    <AlertDescription>
                      <p>
                        Se repuso el stock{anuladaSinPagos ? '.' : ' y se revirtió la caja.'} La venta queda
                        en el historial solo para consulta.
                      </p>
                      {venta.anulacion && (
                        <dl className="mt-1 grid gap-1.5 text-sm text-texto-principal">
                          <div>
                            <dt className="text-texto-suave">Motivo</dt>
                            <dd className="font-medium wrap-break-word">{describirMotivo(venta.anulacion)}</dd>
                          </div>
                          <div>
                            <dt className="text-texto-suave">Anulada por</dt>
                            <dd className="font-medium tabular-nums">
                              {venta.anulacion.nombreUsuario} · {formatearFechaHora(venta.anulacion.fechaHora)}
                            </dd>
                          </div>
                        </dl>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* --- DATOS GENERALES --- */}
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-texto-suave">Fecha y hora de la venta</dt>
                    <dd className="font-medium tabular-nums">{formatearFechaHora(venta.fechaHora)}</dd>
                  </div>
                  <div>
                    <dt className="text-texto-suave">Fecha y hora del pago</dt>
                    <dd className="font-medium tabular-nums">
                      {venta.fechaHoraPago
                        ? formatearFechaHora(venta.fechaHoraPago)
                        : anulada
                          ? '—'
                          : 'Pendiente de pago'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-texto-suave">Origen</dt>
                    <dd className="font-medium">{describirOrigen(venta.origen)}</dd>
                  </div>
                  <div>
                    <dt className="text-texto-suave">Entrega</dt>
                    <dd className="font-medium">{describirEntrega(venta.modalidadEntrega)}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-texto-suave">Cliente</dt>
                    <dd className="truncate font-medium">{venta.clienteReferencia ?? '—'}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-texto-suave">Vendedor</dt>
                    <dd className="truncate font-medium">{venta.vendedor.nombre}</dd>
                  </div>
                </dl>

                <Separator />
                <DetalleProductosComprobante detalles={comprobante.detalles} />
                <Separator />
                <AjustesComprobante comprobante={comprobante} />
                <Separator />
                <TotalesComprobante
                  subtotalProductos={comprobante.subtotalProductos}
                  montoTotal={comprobante.montoTotal}
                />
                <Separator />

                {/* --- PAGOS --- */}
                {anuladaSinPagos ? (
                  <section aria-labelledby="titulo-pagos-anulada" className="flex flex-col gap-2">
                    <h2 id="titulo-pagos-anulada" className="text-base font-bold">
                      Medios de pago
                    </h2>
                    <p className="text-texto-suave">
                      Se anuló antes de cobrarse: no pasó por la caja.
                    </p>
                  </section>
                ) : (
                  <PagosComprobante comprobante={comprobante} />
                )}

                {/* --- ENVIO DEL COMPROBANTE --- */}
                {!anulada && (
                  <>
                    <Separator />
                    <section aria-labelledby="titulo-envio" className="flex flex-col gap-3">
                      <h2 id="titulo-envio" className="text-base font-bold">
                        Enviar comprobante
                      </h2>
                      <div className="flex gap-2">
                        <BotonesEnvioComprobante
                          enlaceWhatsApp={construirEnlaceWhatsApp(comprobante)}
                          enlaceMail={construirEnlaceMail(comprobante)}
                          variante="compacta"
                        />
                      </div>
                    </section>
                  </>
                )}
              </DialogBody>

              {/* --- ACCIONES --- */}
              {/* Sin nada que hacer (plazo vencido y no es un fiado), el pie no se muestra */}
              {(fila.ventanaVigente || fila.puedeCobrarFiado) && (
                // Mobile: el aviso arriba y todos los botones en una sola fila. Desde sm: aviso a la izquierda y botones a la derecha
                <DialogFooter className="flex-col sm:flex-row sm:items-center sm:justify-between">
                  <AvisoVentanaVenta fila={fila} />
                  <div className="flex gap-2 sm:ml-auto">
                    <BotonCobrarFiado
                      fila={fila}
                      onCobrarFiado={acciones.onCobrarFiado}
                      className="min-w-0 shrink flex-1 px-2 sm:flex-none sm:px-4"
                    />
                    <AccionesVentaHistorial fila={fila} acciones={acciones} variante="detalle" />
                  </div>
                </DialogFooter>
              )}
            </>
          )
        })()}
      </DialogContent>
    </Dialog>
  )
}
