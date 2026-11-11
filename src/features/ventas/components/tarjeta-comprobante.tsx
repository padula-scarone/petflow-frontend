import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { formatearFechaHora } from '@/lib/formatear-fecha-hora'
import { AjustesComprobante } from '@/features/ventas/components/ajustes-comprobante'
import { DetalleProductosComprobante } from '@/features/ventas/components/detalle-productos-comprobante'
import { PagosComprobante } from '@/features/ventas/components/pagos-comprobante'
import { TotalesComprobante } from '@/features/ventas/components/totales-comprobante'
import type { Comprobante } from '@/features/ventas/types/comprobante'

/** Props de la tarjeta con todo el desglose de la venta. */
interface TarjetaComprobanteProps {
  comprobante: Comprobante
}

export function TarjetaComprobante({ comprobante }: TarjetaComprobanteProps) {
  const cobrada = comprobante.estado === 'completada'

  return (
    <Card className="gap-5 p-4 shadow-none sm:p-6">
      {/* --- ENCABEZADO --- */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm text-texto-suave">Comprobante</p>
            <p className="text-xl font-bold tabular-nums">{comprobante.numeroComprobante}</p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'h-7 px-3 text-sm',
              cobrada ? 'text-green-700' : 'text-amber-700',
            )}
          >
            {cobrada ? 'Completada' : 'Pendiente de pago'}
          </Badge>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-texto-suave">Fecha y hora</dt>
            <dd className="font-medium tabular-nums">{formatearFechaHora(comprobante.fechaHora)}</dd>
          </div>
          <div>
            <dt className="text-texto-suave">Vendedor</dt>
            <dd className="font-medium">{comprobante.nombreVendedor}</dd>
          </div>
          <div>
            <dt className="text-texto-suave">Canal</dt>
            <dd className="font-medium">
              {comprobante.canalVenta === 'mostrador' ? 'Mostrador' : 'Digital'}
            </dd>
          </div>
          <div>
            <dt className="text-texto-suave">Entrega</dt>
            <dd className="font-medium">{comprobante.tipoEntrega === 'retiro' ? 'Retiro' : 'Envío'}</dd>
          </div>
          {comprobante.clienteReferencia !== null && (
            <div className="min-w-0">
              <dt className="text-texto-suave">Cliente</dt>
              <dd className="truncate font-medium">{comprobante.clienteReferencia}</dd>
            </div>
          )}
        </dl>
      </div>

      <Separator />

      {/* --- DETALLE DE PRODUCTOS --- */}
      <DetalleProductosComprobante detalles={comprobante.detalles} />

      <Separator />

      {/* --- DESCUENTOS --- */}
      <AjustesComprobante comprobante={comprobante} />

      <Separator />

      {/* --- TOTALES --- */}
      <TotalesComprobante
        subtotalProductos={comprobante.subtotalProductos}
        montoTotal={comprobante.montoTotal}
      />

      <Separator />

      {/* --- MEDIOS DE PAGO (O DEUDA EN UN FIADO) --- */}
      <PagosComprobante comprobante={comprobante} />
    </Card>
  )
}
