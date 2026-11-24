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
import { BotonesEnvioComprobante } from '@/features/ventas/components/botones-envio-comprobante'
import { DetalleProductosComprobante } from '@/features/ventas/components/detalle-productos-comprobante'
import { AvisoVentanaVenta } from '@/features/ventas/components/aviso-ventana-venta'
import { AccionDeudaFiado } from '@/features/ventas/deudores/components/accion-deuda-fiado'
import { DeudaFiadoDetalle } from '@/features/ventas/deudores/components/deuda-fiado-detalle'
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

/** Props de la ventana con el detalle de una venta. */
interface DetalleVentaHistorialProps {
  /** null mientras el ventana esta cerrada. */
  detalle: EstadoDetalleVenta | null
  acciones: PropiedadesAccionesVenta
  onCerrar: () => void
  onReintentar: () => void
  onReintentarDeudaFiado: () => void
}

export function DetalleVentaHistorial({
  detalle,
  acciones,
  onCerrar,
  onReintentar,
  onReintentarDeudaFiado,
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
                    className="mt-2 bg-fondo-tarjeta text-texto-principal"
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
          const { venta, fila, deudaFiado } = detalle
          const comprobante = convertirVentaAComprobante(venta)
          const anulada = venta.estado === 'ANULADA'
          const anuladaSinPagos = anulada && venta.pagos.length === 0

          return (
            <>
              <DialogBody>
                {/* --- ENCABEZADO: VA DENTRO DEL SCROLL --- */}
                {/* Se mueve con el contenido en lugar de quedar fijo y ocupar espacio. pr-14: no pisa la X, que si es fija */}
                <div className="flex flex-col gap-1 pr-14">
                  <DialogDescription>Comprobante</DialogDescription>
                  <DialogTitle className="text-titulo-pagina tabular-nums">{venta.numeroComprobante}</DialogTitle>
                  <div className="pt-1">
                    <InsigniaEstadoVenta estado={venta.estado} />
                  </div>
                </div>

                {anulada && (
                  <Alert role="status" className="text-red-700">
                    <Ban aria-hidden="true" />
                    <AlertTitle>Venta anulada</AlertTitle>
                    <AlertDescription>
                      <p>
                        Se repuso el stock{anuladaSinPagos ? '.' : ' y se revirtió la caja.'} La venta queda
                        en el historial solo para consulta.
                      </p>
                      {venta.anulacion && (
                        <dl className="mt-1 grid gap-1.5 text-cuerpo text-texto-principal">
                          <div>
                            <dt className="text-texto-suave">Motivo</dt>
                            <dd className="font-medium wrap-break-word">{venta.anulacion.motivo}</dd>
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
                {/* Dos columnas fijas, una por lado de la venta: a la izquierda lo de quien vende (fecha, origen, vendedor) y a
                    la derecha lo del cliente (pago, entrega, cliente). Con tres columnas esa lectura se perderia */}
                <dl className="grid grid-cols-2 gap-x-bloque gap-y-interno text-cuerpo">
                  <div>
                    <dt className="text-texto-suave">Fecha de la venta</dt>
                    <dd className="font-medium tabular-nums">{formatearFechaHora(venta.fechaHora)}</dd>
                  </div>
                  <div>
                    <dt className="text-texto-suave">Fecha del pago</dt>
                    <dd className="font-medium tabular-nums">
                      {/* Sin pago (fiado o anulada) alcanza un guion: el estado ya esta en la insignia */}
                      {venta.fechaHoraPago ? formatearFechaHora(venta.fechaHoraPago) : '—'}
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
                    <dt className="text-texto-suave">Vendedor</dt>
                    <dd className="truncate font-medium">{venta.vendedor.nombre}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-texto-suave">Cliente</dt>
                    <dd className="truncate font-medium">
                      {venta.deudor?.nombreCompleto ?? venta.clienteReferencia ?? '—'}
                    </dd>
                  </div>
                </dl>

                {/* --- DEUDA: SOLO UN FIADO PENDIENTE CON DEUDOR --- */}
                {venta.estado === 'PENDIENTE_PAGO' && venta.deudor !== null && (
                  <>
                    <Separator />
                    <DeudaFiadoDetalle
                      fechaEstimadaPago={venta.fechaEstimadaPago}
                      deudaFiado={deudaFiado}
                      onReintentar={onReintentarDeudaFiado}
                    />
                  </>
                )}

                <Separator />
                <DetalleProductosComprobante detalles={comprobante.detalles} />
                <Separator />
                <TotalesComprobante comprobante={comprobante} anulada={anulada} />

                {/* --- PAGOS: UN FIADO PENDIENTE NO TIENE; SU DEUDA YA ESTA EN EL RESUMEN --- */}
                {anuladaSinPagos ? (
                  <>
                    <Separator />
                    <section aria-labelledby="titulo-pagos-anulada" className="flex flex-col gap-2">
                      <h2 id="titulo-pagos-anulada" className="text-titulo-seccion font-bold">
                        Medios de pago
                      </h2>
                      <p className="text-texto-suave">
                        Se anuló antes de cobrarse: no pasó por la caja.
                      </p>
                    </section>
                  </>
                ) : (
                  comprobante.estado === 'completada' && (
                    <>
                      <Separator />
                      <PagosComprobante comprobante={comprobante} />
                    </>
                  )
                )}

                {/* --- ENVIO DEL COMPROBANTE --- */}
                {!anulada && (
                  <>
                    <Separator />
                    <section aria-labelledby="titulo-envio" className="flex flex-col gap-interno">
                      <h2 id="titulo-envio" className="text-titulo-seccion font-bold">
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
              {(fila.ventanaVigente || (fila.estado === 'PENDIENTE_PAGO' && fila.deudor !== null)) && (
                // Mobile: el aviso arriba y todos los botones en una sola fila. Desde sm: aviso a la izquierda y botones a la derecha
                <DialogFooter className="flex-col sm:flex-row sm:items-center sm:justify-between">
                  <AvisoVentanaVenta fila={fila} />
                  <div className="flex gap-2 sm:ml-auto">
                    <AccionDeudaFiado fila={fila} className="min-w-0 shrink flex-1 px-2 sm:flex-none sm:px-4" />
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
