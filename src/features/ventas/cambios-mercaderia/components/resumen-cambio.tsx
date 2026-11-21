import { Card } from '@/components/ui/card'
import type { BorradorCambio, ResumenSaldoCambio } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { describirCantidadArticulo, describirPesoKg } from '@/features/ventas/cambios-mercaderia/utils/describir-articulo-cambio'
import { NombreProducto } from '@/features/ventas/components/nombre-producto'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props del resumen previo a confirmar. */
interface ResumenCambioProps {
  borrador: BorradorCambio
  resumenSaldo: ResumenSaldoCambio
}

/** Resumen previo: venta vinculada, lo que entra, lo que sale y el saldo. Solo lectura. */
export function ResumenCambio({ borrador, resumenSaldo }: ResumenCambioProps) {
  const { ventaVinculada, articuloDevuelto, articuloEntregado } = borrador
  if (!articuloDevuelto || !articuloEntregado) return null

  const cantidadDevuelta = articuloDevuelto.esBolsaAbierta
    ? `Bolsa abierta · ${describirPesoKg(articuloDevuelto.pesoDevueltoKg ?? 0)}`
    : describirCantidadArticulo(articuloDevuelto.cantidad ?? 0, articuloDevuelto.formatoVenta)

  return (
    <Card className="gap-interno p-contorno shadow-none" aria-labelledby="titulo-resumen-cambio">
      <h2 id="titulo-resumen-cambio" className="text-titulo-seccion font-bold">
        Resumen del cambio
      </h2>
      <dl className="grid gap-interno text-cuerpo">
        <div>
          <dt className="text-texto-suave">Venta vinculada</dt>
          <dd className="font-medium tabular-nums">
            {ventaVinculada ? ventaVinculada.numeroComprobante : 'Sin venta vinculada'}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-interno">
          <div className="min-w-0">
            <dt className="text-texto-suave">Devuelve</dt>
            <dd className="font-medium wrap-break-word">
              <NombreProducto nombre={articuloDevuelto.nombreProducto} formato={articuloDevuelto.formatoVenta} />
            </dd>
            <dd className="text-auxiliar text-texto-suave tabular-nums">{cantidadDevuelta}</dd>
          </div>
          <dd className="shrink-0 tabular-nums">− {formatearMoneda(resumenSaldo.valorDevuelto)}</dd>
        </div>
        <div className="flex items-start justify-between gap-interno">
          <div className="min-w-0">
            <dt className="text-texto-suave">Se lleva</dt>
            <dd className="font-medium wrap-break-word">
              <NombreProducto nombre={articuloEntregado.nombreProducto} formato={articuloEntregado.formatoVenta} />
            </dd>
            <dd className="text-auxiliar text-texto-suave tabular-nums">
              {describirCantidadArticulo(articuloEntregado.cantidad ?? 0, articuloEntregado.formatoVenta)}
            </dd>
          </div>
          <dd className="shrink-0 tabular-nums">{formatearMoneda(resumenSaldo.valorEntregado)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-interno pt-interno">
          <dt className="text-titulo-seccion font-bold">Saldo a cobrar</dt>
          <dd className="text-cifra-secundaria font-bold tabular-nums">{formatearMoneda(resumenSaldo.saldo)}</dd>
        </div>
      </dl>
    </Card>
  )
}
