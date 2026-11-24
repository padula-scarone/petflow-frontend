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
  AccionesDevolucion,
  AvisoVentanaDevolucion,
  InsigniaEstadoDevolucion,
} from '@/features/ventas/devoluciones/components/piezas-fila-devolucion'
import type {
  ArticuloDevolucionDetalle,
  EstadoDetalleDevolucion,
  PropiedadesAccionesDevolucion,
} from '@/features/ventas/devoluciones/types/devolucion'
import {
  describirCantidadArticulo,
  describirDevolucion,
} from '@/features/ventas/devoluciones/utils/describir-articulo-devolucion'
import { describirMotivoDevolucion } from '@/features/ventas/devoluciones/utils/describir-motivo-devolucion'
import { FilasDatosEnvio } from '@/features/ventas/components/filas-datos-envio'
import { NombreProducto } from '@/features/ventas/components/nombre-producto'
import { listarDatosEnvio } from '@/features/ventas/utils/listar-datos-envio'
import { formatearFechaHora } from '@/lib/formatear-fecha-hora'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props de la ventana con el detalle de una devolución. */
interface DetalleDevolucionProps {
  /** null mientras la ventana esta cerrada. */
  detalle: EstadoDetalleDevolucion | null
  acciones: PropiedadesAccionesDevolucion
  onCerrar: () => void
  onReintentar: () => void
}

/** Un articulo de la devolución: nombre, cantidad por precio unitario y subtotal a la derecha. */
function BloqueArticulo({
  titulo,
  articulo,
  notas,
  cantidadTexto,
  precioTexto,
}: {
  titulo: string
  articulo: ArticuloDevolucionDetalle
  notas: string[]
  cantidadTexto: string
  precioTexto: string
}) {
  return (
    <section aria-label={titulo} className="flex flex-col gap-2">
      <h2 className="text-titulo-seccion font-bold">{titulo}</h2>
      <div className="flex items-start justify-between gap-interno rounded-grande border p-contorno">
        <div className="min-w-0">
          <p className="font-medium wrap-break-word">
            <NombreProducto nombre={articulo.nombreProducto} formato={articulo.formatoVenta} />
          </p>
          <p className="text-cuerpo text-texto-suave tabular-nums">
            {cantidadTexto} × {precioTexto}
          </p>
          {notas.map((nota) => (
            <p key={nota} className="text-cuerpo text-texto-suave">
              {nota}
            </p>
          ))}
        </div>
        <p className="shrink-0 font-bold tabular-nums">{formatearMoneda(articulo.subtotal)}</p>
      </div>
    </section>
  )
}

export function DetalleDevolucion({ detalle, acciones, onCerrar, onReintentar }: DetalleDevolucionProps) {
  return (
    <Dialog open={detalle !== null} onOpenChange={(abierto) => !abierto && onCerrar()}>
      <DialogContent className="sm:max-w-2xl">
        {detalle?.tipo === 'cargando' && (
          <>
            <DialogHeader>
              <DialogTitle>Detalle de la devolución</DialogTitle>
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
              <DialogTitle>Detalle de la devolución</DialogTitle>
              <DialogDescription>No se pudo mostrar la devolución.</DialogDescription>
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
          const { devolucion, fila } = detalle
          const anulado = devolucion.estado === 'ANULADO'
          const devuelto = devolucion.articuloDevuelto
          const entregado = devolucion.articuloEntregado
          const pago = devolucion.pagoSaldo

          return (
            <>
              <DialogBody>
                {/* --- ENCABEZADO: VA DENTRO DEL SCROLL --- */}
                {/* pr-14: no pisa la X, que es fija */}
                <div className="flex flex-col gap-1 pr-14">
                  <DialogDescription>Devolución</DialogDescription>
                  <DialogTitle className="text-titulo-pagina tabular-nums">N.º {devolucion.idDevolucion}</DialogTitle>
                  <div className="pt-1">
                    <InsigniaEstadoDevolucion estado={devolucion.estado} />
                  </div>
                </div>

                {anulado && (
                  <Alert role="status" className="text-red-700">
                    <Ban aria-hidden="true" />
                    <AlertTitle>Devolución anulada</AlertTitle>
                    <AlertDescription>
                      <p>
                        Se revirtió el stock{devolucion.saldoResultante > 0 ? ' y se restó el saldo de la caja' : ''}. La
                        devolución queda en la lista solo para consulta.
                      </p>
                      {devolucion.anulacion && (
                        <dl className="mt-1 grid gap-1.5 text-cuerpo text-texto-principal">
                          <div>
                            <dt className="text-texto-suave">Motivo</dt>
                            <dd className="font-medium wrap-break-word">
                              {describirMotivoDevolucion(devolucion.anulacion.motivo)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-texto-suave">Anulada por</dt>
                            <dd className="font-medium tabular-nums">
                              {devolucion.anulacion.nombreUsuario} · {formatearFechaHora(devolucion.anulacion.fechaHora)}
                            </dd>
                          </div>
                        </dl>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* --- DATOS GENERALES --- */}
                <dl className="grid grid-cols-2 gap-x-bloque gap-y-interno text-cuerpo sm:grid-cols-3">
                  <div>
                    <dt className="text-texto-suave">Fecha y hora</dt>
                    <dd className="font-medium tabular-nums">{formatearFechaHora(devolucion.fechaHora)}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-texto-suave">Vendedor</dt>
                    <dd className="truncate font-medium">{devolucion.vendedor.nombre}</dd>
                  </div>
                  <div className="col-span-2 min-w-0 sm:col-span-1">
                    <dt className="text-texto-suave">Venta vinculada</dt>
                    <dd className="font-medium tabular-nums">
                      {devolucion.ventaVinculada ? devolucion.ventaVinculada.numeroComprobante : 'Sin venta vinculada'}
                    </dd>
                  </div>
                  {/* Datos del envio de la venta original: solo con Envio y con valor */}
                  {devolucion.ventaVinculada !== null && (
                    <FilasDatosEnvio
                      datos={listarDatosEnvio(
                        devolucion.ventaVinculada.tipoEntrega === 'envio',
                        devolucion.ventaVinculada.direccionEnvio,
                        devolucion.ventaVinculada.destinatarioEnvio,
                      )}
                    />
                  )}
                </dl>

                <Separator />

                {/* --- ARTICULOS --- */}
                <BloqueArticulo
                  titulo="Artículo devuelto"
                  articulo={devuelto}
                  cantidadTexto={describirDevolucion(devuelto.cantidad, devuelto.formatoVenta, devuelto.pesoDevueltoKg)}
                  precioTexto={`${formatearMoneda(devuelto.precioUnitario)}${devuelto.esBolsaAbierta ? ' la bolsa' : ''}`}
                  notas={
                    devuelto.esBolsaAbierta
                      ? [
                          `Bolsa abierta: el contenido ingresó al stock a granel de «${devuelto.nombreProductoStockIngresado}».`,
                          'Se acreditó la fracción devuelta del precio de la bolsa.',
                        ]
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
                <section aria-labelledby="titulo-saldo-devolucion" className="flex flex-col gap-2">
                  <h2 id="titulo-saldo-devolucion" className="text-titulo-seccion font-bold">
                    Saldo
                  </h2>
                  <dl className="grid gap-1.5 text-cuerpo">
                    <div className="flex justify-between gap-interno">
                      <dt className="text-texto-suave">Valor entregado</dt>
                      <dd className="tabular-nums">{formatearMoneda(devolucion.valorEntregado)}</dd>
                    </div>
                    <div className="flex justify-between gap-interno">
                      <dt className="text-texto-suave">Valor devuelto</dt>
                      <dd className="tabular-nums">− {formatearMoneda(devolucion.valorDevuelto)}</dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-interno pt-interno">
                      <dt className="text-titulo-seccion font-bold">Saldo cobrado</dt>
                      <dd className="text-cifra-secundaria font-bold tabular-nums">{formatearMoneda(devolucion.saldoResultante)}</dd>
                    </div>
                  </dl>
                  {pago ? (
                    <dl className="grid gap-1.5 text-cuerpo">
                      <div className="flex justify-between gap-interno">
                        <dt className="text-texto-suave">Medio de pago</dt>
                        <dd className="font-medium">{pago.nombreMedioPago}</dd>
                      </div>
                      {pago.montoRecibido !== null && (
                        <>
                          <div className="flex justify-between gap-interno">
                            <dt className="text-texto-suave">Monto recibido</dt>
                            <dd className="tabular-nums">{formatearMoneda(pago.montoRecibido)}</dd>
                          </div>
                          <div className="flex justify-between gap-interno">
                            <dt className="text-texto-suave">Vuelto</dt>
                            <dd className="tabular-nums">{formatearMoneda(pago.vuelto ?? 0)}</dd>
                          </div>
                        </>
                      )}
                    </dl>
                  ) : (
                    <p className="text-cuerpo text-texto-suave">No hubo diferencia para cobrar.</p>
                  )}
                </section>

                <Separator />

                {/* --- MOTIVO --- */}
                <section aria-labelledby="titulo-motivo-devolucion" className="flex flex-col gap-1">
                  <h2 id="titulo-motivo-devolucion" className="text-titulo-seccion font-bold">
                    Motivo de la devolución
                  </h2>
                  <p className="text-cuerpo wrap-break-word">
                    {describirMotivoDevolucion(devolucion.motivoDevolucion)}
                  </p>
                </section>
              </DialogBody>

              {/* --- ACCIONES --- */}
              {/* Sin nada que hacer (plazo vencido o anulado), el pie no se muestra */}
              {fila.ventanaVigente && (
                // Mobile: el aviso arriba y los botones en una sola fila. Desde sm: aviso a la izquierda y botones a la derecha
                <DialogFooter className="flex-col sm:flex-row sm:items-center sm:justify-between">
                  <AvisoVentanaDevolucion fila={fila} />
                  <div className="flex gap-2 sm:ml-auto">
                    <AccionesDevolucion fila={fila} acciones={acciones} variante="detalle" />
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
