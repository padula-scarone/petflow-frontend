import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { formatearFechaHora } from '@/lib/formatear-fecha-hora'
import { DetalleProductosComprobante } from '@/features/ventas/components/detalle-productos-comprobante'
import { FilasDatosEnvio } from '@/features/ventas/components/filas-datos-envio'
import { PagosComprobante } from '@/features/ventas/components/pagos-comprobante'
import { TotalesComprobante } from '@/features/ventas/components/totales-comprobante'
import type { Comprobante } from '@/features/ventas/types/comprobante'
import { listarDatosEnvio } from '@/features/ventas/utils/listar-datos-envio'

/** Props de la tarjeta con todo el desglose de la venta. */
interface TarjetaComprobanteProps {
  comprobante: Comprobante
}

export function TarjetaComprobante({ comprobante }: TarjetaComprobanteProps) {
  const cobrada = comprobante.estado === 'completada'

  return (
    <Card className="gap-bloque p-contorno">
      {/* --- ENCABEZADO --- */}
      <div className="flex flex-col gap-bloque">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-cuerpo text-texto-suave">Comprobante</p>
            <p className="text-titulo-pagina font-bold tabular-nums">{comprobante.numeroComprobante}</p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'h-7 px-3 text-cuerpo',
              cobrada ? 'text-green-700' : 'text-amber-700',
            )}
          >
            {cobrada ? 'Completada' : 'Pendiente de pago'}
          </Badge>
        </div>

        {/* Dos columnas, una por lado de la venta, igual que en el detalle del Historial: a la izquierda lo de quien
            vende (canal, vendedor) y a la derecha lo del cliente (entrega, cliente). La fecha va sola, a todo el ancho */}
        <dl className="grid grid-cols-2 gap-x-bloque gap-y-interno text-cuerpo">
          <div className="col-span-2">
            <dt className="text-texto-suave">Fecha de la venta</dt>
            <dd className="font-medium tabular-nums">{formatearFechaHora(comprobante.fechaHora)}</dd>
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
          <div>
            <dt className="text-texto-suave">Vendedor</dt>
            <dd className="font-medium">{comprobante.nombreVendedor}</dd>
          </div>
          {/* Solo con Envio y con valor: un dato null no deja una fila vacia */}
          <FilasDatosEnvio
            datos={listarDatosEnvio(
              comprobante.tipoEntrega === 'envio',
              comprobante.direccionEnvio,
              comprobante.destinatarioEnvio,
            )}
          />
        </dl>
      </div>

      <Separator />

      {/* --- DETALLE DE PRODUCTOS --- */}
      <DetalleProductosComprobante detalles={comprobante.detalles} />

      <Separator />

      {/* --- RESUMEN: SUBTOTAL, DESCUENTOS Y RECARGOS, Y TOTAL (O DEUDA EN UN FIADO) --- */}
      <TotalesComprobante comprobante={comprobante} />

      {/* --- MEDIOS DE PAGO: UN FIADO TODAVIA NO TIENE --- */}
      {comprobante.estado === 'completada' && (
        <>
          <Separator />
          <PagosComprobante comprobante={comprobante} />
        </>
      )}
    </Card>
  )
}
