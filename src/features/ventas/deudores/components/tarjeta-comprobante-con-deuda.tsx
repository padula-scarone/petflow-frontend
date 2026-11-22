import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatearFechaHora } from '@/lib/formatear-fecha-hora'
import { DetalleProductosComprobante } from '@/features/ventas/components/detalle-productos-comprobante'
import { PagosComprobante } from '@/features/ventas/components/pagos-comprobante'
import { BloqueDeudorComprobante } from '@/features/ventas/deudores/components/bloque-deudor-comprobante'
import { TotalesComprobanteConDeuda } from '@/features/ventas/deudores/components/totales-comprobante-con-deuda'
import type { ComprobanteConDeuda } from '@/features/ventas/deudores/types/comprobante-con-deuda'

/** Props de la tarjeta con todo el desglose de una venta con deuda. */
interface TarjetaComprobanteConDeudaProps {
  comprobante: ComprobanteConDeuda
}

/**
 * Comprobante de una venta con deuda. Una deuda total no tiene medios de pago (no pago nada); una parcial muestra
 * con que pago la parte inicial.
 */
export function TarjetaComprobanteConDeuda({ comprobante }: TarjetaComprobanteConDeudaProps) {
  return (
    <Card className="gap-bloque p-contorno">
      {/* --- ENCABEZADO --- */}
      <div className="flex flex-col gap-bloque">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-cuerpo text-texto-suave">Comprobante</p>
            <p className="text-titulo-pagina font-bold tabular-nums">{comprobante.numeroComprobante}</p>
          </div>
          <Badge variant="outline" className="h-7 px-3 text-cuerpo text-amber-700">
            {comprobante.tipoDeuda === 'TOTAL' ? 'Deuda total' : 'Pago parcial'}
          </Badge>
        </div>

        <dl className="grid grid-cols-2 gap-x-bloque gap-y-interno text-cuerpo">
          <div className="col-span-2">
            <dt className="text-texto-suave">Fecha de la venta</dt>
            <dd className="font-medium tabular-nums">{formatearFechaHora(comprobante.fechaHora)}</dd>
          </div>
          <div>
            <dt className="text-texto-suave">Canal</dt>
            <dd className="font-medium">{comprobante.canalVenta === 'mostrador' ? 'Mostrador' : 'Digital'}</dd>
          </div>
          <div>
            <dt className="text-texto-suave">Entrega</dt>
            <dd className="font-medium">{comprobante.tipoEntrega === 'retiro' ? 'Retiro' : 'Envío'}</dd>
          </div>
          <div>
            <dt className="text-texto-suave">Vendedor</dt>
            <dd className="font-medium">{comprobante.nombreVendedor}</dd>
          </div>
        </dl>
      </div>

      <Separator />

      {/* --- DETALLE DE PRODUCTOS --- */}
      <DetalleProductosComprobante detalles={comprobante.detalles} />

      <Separator />

      {/* --- RESUMEN: IMPORTE, LO PAGADO AHORA Y LO QUE QUEDA DEBIENDO --- */}
      <TotalesComprobanteConDeuda comprobante={comprobante} />

      {/* --- MEDIOS DE PAGO: SOLO SI PAGO UNA PARTE --- */}
      {comprobante.pagos.length > 0 && (
        <>
          <Separator />
          <PagosComprobante comprobante={comprobante} />
        </>
      )}

      <Separator />

      {/* --- DEUDOR Y FECHA ESTIMADA --- */}
      <BloqueDeudorComprobante deudor={comprobante.deudor} fechaEstimadaPago={comprobante.fechaEstimadaPago} />
    </Card>
  )
}
