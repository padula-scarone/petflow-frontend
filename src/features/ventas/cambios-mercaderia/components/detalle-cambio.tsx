import { Ban, TriangleAlert } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AccionesCambio,
  AvisoVentanaCambio,
  InsigniaEstadoCambio,
} from '@/features/ventas/cambios-mercaderia/components/piezas-fila-cambio'
import type {
  ArticuloCambioDetalle,
  EstadoDetalleCambio,
  PropiedadesAccionesCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import {
  describirCantidadArticulo,
  describirPesoKg,
} from '@/features/ventas/cambios-mercaderia/utils/describir-articulo-cambio'
import { describirMotivoCambio } from '@/features/ventas/cambios-mercaderia/utils/describir-motivo-cambio'
import { formatearFechaHora } from '@/lib/formatear-fecha-hora'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props de la ventana con el detalle de un cambio. */
interface DetalleCambioProps {
  /** null mientras la ventana esta cerrada. */
  detalle: EstadoDetalleCambio | null
  acciones: PropiedadesAccionesCambio
  onCerrar: () => void
  onReintentar: () => void
}

/** Un articulo del cambio: nombre, cantidad por precio unitario y subtotal a la derecha. */
function BloqueArticulo({
  titulo,
  articulo,
  notas,
  cantidadTexto,
  precioTexto,
}: {
  titulo: string
  articulo: ArticuloCambioDetalle
  notas: string[]
  cantidadTexto: string
  precioTexto: string
}) {
  return (
    <section aria-label={titulo} className="flex flex-col gap-2">
      <h2 className="text-base font-bold">{titulo}</h2>
      <div className="flex items-start justify-between gap-3 rounded-grande border p-3">
        <div className="min-w-0">
          <p className="font-medium wrap-break-word">{articulo.nombreProducto}</p>
          <p className="text-sm text-texto-suave tabular-nums">
            {cantidadTexto} × {precioTexto}
          </p>
          {notas.map((nota) => (
            <p key={nota} className="text-sm text-texto-suave">
              {nota}
            </p>
          ))}
        </div>
        <p className="shrink-0 font-bold tabular-nums">{formatearMoneda(articulo.subtotal)}</p>
      </div>
    </section>
  )
}

export function DetalleCambio({ detalle, acciones, onCerrar, onReintentar }: DetalleCambioProps) {
  return (
    <Dialog open={detalle !== null} onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="sm:max-w-2xl">
        {detalle?.tipo === 'cargando' && (
          <>
            <DialogHeader>
              <DialogTitle>Detalle del cambio</DialogTitle>
              <DialogDescription>Cargando los datos…</DialogDescription>
            </DialogHeader>
            <DialogBody role="status" aria-busy="true">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </DialogBody>
          </>
        )}

        {detalle?.tipo === 'error' && (
          <>
            <DialogHeader>
              <DialogTitle>Detalle del cambio</DialogTitle>
              <DialogDescription>No se pudo mostrar el cambio.</DialogDescription>
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
          const { cambio, fila } = detalle
          const anulado = cambio.estado === 'ANULADO'
          const devuelto = cambio.articuloDevuelto
          const entregado = cambio.articuloEntregado
          const pago = cambio.pagoSaldo

          return (
            <>
              <DialogBody>
                {/* --- ENCABEZADO: VA DENTRO DEL SCROLL --- */}
                {/* pr-10: no pisa la X, que es fija */}
                <div className="flex flex-col gap-1 pr-10">
                  <DialogDescription>Cambio</DialogDescription>
                  <DialogTitle className="text-xl tabular-nums">N.º {cambio.idCambio}</DialogTitle>
                  <div className="pt-1">
                    <InsigniaEstadoCambio estado={cambio.estado} />
                  </div>
                </div>

                {anulado && (
                  <Alert role="status">
                    <Ban aria-hidden="true" />
                    <AlertTitle>Cambio anulado</AlertTitle>
                    <AlertDescription>
                      <p>
                        Se revirtió el stock{cambio.saldoResultante > 0 ? ' y se restó el saldo de la caja' : ''}. El
                        cambio queda en la lista solo para consulta.
                      </p>
                      {cambio.anulacion && (
                        <dl className="mt-1 grid gap-1.5 text-sm text-texto-principal">
                          <div>
                            <dt className="text-texto-suave">
                              Motivo{cambio.anulacion.accion === 'EDITAR' ? ' (anulado por una edición)' : ''}
                            </dt>
                            <dd className="font-medium wrap-break-word">
                              {describirMotivoCambio(cambio.anulacion.codigoMotivo, cambio.anulacion.detalleMotivo)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-texto-suave">Anulado por</dt>
                            <dd className="font-medium tabular-nums">
                              {cambio.anulacion.nombreUsuario} · {formatearFechaHora(cambio.anulacion.fechaHora)}
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
                    <dt className="text-texto-suave">Fecha y hora</dt>
                    <dd className="font-medium tabular-nums">{formatearFechaHora(cambio.fechaHora)}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-texto-suave">Vendedor</dt>
                    <dd className="truncate font-medium">{cambio.vendedor.nombre}</dd>
                  </div>
                  <div className="col-span-2 min-w-0 sm:col-span-1">
                    <dt className="text-texto-suave">Venta vinculada</dt>
                    <dd className="font-medium tabular-nums">
                      {cambio.ventaVinculada ? cambio.ventaVinculada.numeroComprobante : 'Sin venta vinculada'}
                    </dd>
                  </div>
                </dl>

                <Separator />

                {/* --- ARTICULOS --- */}
                <BloqueArticulo
                  titulo="Artículo devuelto"
                  articulo={devuelto}
                  cantidadTexto={
                    devuelto.esBolsaAbierta
                      ? describirPesoKg(devuelto.cantidad)
                      : describirCantidadArticulo(devuelto.cantidad, devuelto.formatoVenta)
                  }
                  precioTexto={`${formatearMoneda(devuelto.precioUnitario)}${devuelto.esBolsaAbierta ? '/kg' : ''}`}
                  notas={
                    devuelto.esBolsaAbierta
                      ? [`Bolsa abierta: el contenido ingresó al stock a granel de «${devuelto.nombreProductoStockIngresado}».`]
                      : []
                  }
                />
                <BloqueArticulo
                  titulo="Artículo entregado"
                  articulo={entregado}
                  cantidadTexto={describirCantidadArticulo(entregado.cantidad, entregado.formatoVenta)}
                  precioTexto={formatearMoneda(entregado.precioUnitario)}
                  notas={[]}
                />

                <Separator />

                {/* --- SALDO Y COBRO --- */}
                <section aria-labelledby="titulo-saldo-cambio" className="flex flex-col gap-2">
                  <h2 id="titulo-saldo-cambio" className="text-base font-bold">
                    Saldo
                  </h2>
                  <dl className="grid gap-1.5 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-texto-suave">Valor entregado</dt>
                      <dd className="tabular-nums">{formatearMoneda(cambio.valorEntregado)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-texto-suave">Valor devuelto</dt>
                      <dd className="tabular-nums">− {formatearMoneda(cambio.valorDevuelto)}</dd>
                    </div>
                    <div className="flex justify-between gap-3 border-t pt-2 text-base font-bold">
                      <dt>Saldo cobrado</dt>
                      <dd className="tabular-nums">{formatearMoneda(cambio.saldoResultante)}</dd>
                    </div>
                  </dl>
                  {pago ? (
                    <dl className="grid gap-1.5 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt className="text-texto-suave">Medio de pago</dt>
                        <dd className="font-medium">{pago.nombreMedioPago}</dd>
                      </div>
                      {pago.montoRecibido !== null && (
                        <>
                          <div className="flex justify-between gap-3">
                            <dt className="text-texto-suave">Monto recibido</dt>
                            <dd className="tabular-nums">{formatearMoneda(pago.montoRecibido)}</dd>
                          </div>
                          <div className="flex justify-between gap-3">
                            <dt className="text-texto-suave">Vuelto</dt>
                            <dd className="tabular-nums">{formatearMoneda(pago.vuelto ?? 0)}</dd>
                          </div>
                        </>
                      )}
                    </dl>
                  ) : (
                    <p className="text-sm text-texto-suave">No hubo diferencia para cobrar.</p>
                  )}
                </section>

                <Separator />

                {/* --- MOTIVO --- */}
                <section aria-labelledby="titulo-motivo-cambio" className="flex flex-col gap-1">
                  <h2 id="titulo-motivo-cambio" className="text-base font-bold">
                    Motivo del cambio
                  </h2>
                  <p className="text-sm wrap-break-word">
                    {describirMotivoCambio(cambio.motivo.codigoMotivo, cambio.motivo.detalleMotivo)}
                  </p>
                </section>
              </DialogBody>

              {/* --- ACCIONES --- */}
              {/* Sin nada que hacer (plazo vencido o anulado), el pie no se muestra */}
              {fila.ventanaVigente && (
                // Mobile: el aviso arriba y los botones en una sola fila. Desde sm: aviso a la izquierda y botones a la derecha
                <DialogFooter className="flex-col sm:flex-row sm:items-center sm:justify-between">
                  <AvisoVentanaCambio fila={fila} />
                  <div className="flex gap-2 sm:ml-auto">
                    <AccionesCambio fila={fila} acciones={acciones} variante="detalle" />
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
