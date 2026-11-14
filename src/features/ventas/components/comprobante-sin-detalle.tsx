import { CircleCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { BotonNuevaVenta } from '@/features/ventas/components/boton-nueva-venta'
import { EstadoErrorLista } from '@/features/ventas/components/estado-error-lista'
import type { EstadoComprobanteVenta } from '@/features/ventas/types/comprobante'

/** Props del comprobante mientras se pide su detalle o si el pedido falla. */
interface ComprobanteSinDetalleProps {
  estado: Extract<EstadoComprobanteVenta, { fase: 'cargando' | 'error' }>
  onReintentar: () => void
  onNuevaVenta: () => void
}

/**
 * La venta ya esta registrada en las dos fases: el encabezado usa lo que confirmo el alta (numero y total),
 * asi el vendedor sabe que no hay que cobrar de nuevo aunque el detalle todavia no haya llegado.
 */
export function ComprobanteSinDetalle({
  estado,
  onReintentar,
  onNuevaVenta,
}: ComprobanteSinDetalleProps) {
  const { registro } = estado

  return (
    <section className="flex min-h-full flex-col gap-6">
      {/* --- ENCABEZADO: LO QUE CONFIRMO EL ALTA --- */}
      <header className="flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-exito text-texto-sobre-exito">
          <CircleCheck aria-hidden="true" className="size-8" />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">Venta registrada</h1>
          <p className="text-texto-suave tabular-nums">
            {registro.numeroComprobante} · {formatearMoneda(registro.montoTotal)}
          </p>
        </div>
      </header>

      {estado.fase === 'cargando' ? (
        // --- CARGANDO EL DETALLE ---
        <Card role="status" aria-busy="true" className="gap-4 p-4 shadow-none sm:p-6">
          <span className="sr-only">Cargando el comprobante</span>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </Card>
      ) : (
        // --- FALLO EL DETALLE: LA VENTA IGUAL EXISTE ---
        <>
          <EstadoErrorLista
            titulo="No pudimos cargar el comprobante"
            mensaje={`${estado.mensaje} La venta ya está registrada: no hace falta volver a cobrarla.`}
            onReintentar={onReintentar}
          />
          <BotonNuevaVenta onNuevaVenta={onNuevaVenta} className="w-full sm:w-fit" />
        </>
      )}
    </section>
  )
}
