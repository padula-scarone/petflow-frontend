import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { EstadoProximoPago } from '@/features/ventas/deudores/components/estado-proximo-pago'
import type { FilaDeudor } from '@/features/ventas/deudores/types/cuenta-corriente'

/** Props de la tarjeta de un deudor (mobile y pantallas medianas). */
interface TarjetaDeudorProps {
  fila: FilaDeudor
  onAbrirFicha: (idDeudor: number) => void
}

/** Tarjeta de un deudor. Toda la tarjeta abre la ficha: el nombre es el boton y se estira sobre ella. */
export function TarjetaDeudor({ fila, onAbrirFicha }: TarjetaDeudorProps) {
  const tieneSaldo = fila.saldo > 0

  return (
    <Card className="relative h-full min-w-0 gap-interno p-contorno transition-colors hover:bg-fondo-hover/60 has-[button:focus-visible]:ring-[3px] has-[button:focus-visible]:ring-foco/50">
      {/* --- NOMBRE Y SALDO --- */}
      <div className="flex items-start justify-between gap-interno">
        <div className="min-w-0">
          <button
            type="button"
            aria-label={`Ver la ficha de ${fila.nombreCompleto}`}
            className="max-w-full truncate text-left font-bold outline-none after:absolute after:inset-0"
            onClick={() => onAbrirFicha(fila.idDeudor)}
          >
            {fila.nombreCompleto}
          </button>
          <p className="text-cuerpo text-texto-suave tabular-nums">DNI {fila.dni}</p>
        </div>
        <p className="flex shrink-0 flex-col items-end">
          <span className="text-auxiliar text-texto-suave">Saldo</span>
          <span
            className={cn(
              'text-cifra-secundaria font-bold tabular-nums',
              !tieneSaldo && 'font-normal text-texto-suave',
            )}
          >
            {formatearMoneda(fila.saldo)}
          </span>
        </p>
      </div>

      {/* --- FIADOS Y PROXIMO PAGO --- */}
      <dl className="mt-auto flex flex-wrap justify-between gap-x-bloque gap-y-1 border-t pt-interno text-cuerpo">
        <div>
          <dt className="text-auxiliar text-texto-suave">Fiados pendientes</dt>
          <dd className="font-medium tabular-nums">{fila.cantidadFiadosPendientes}</dd>
        </div>
        <div>
          <dt className="text-auxiliar text-texto-suave">Próximo pago</dt>
          <dd className="font-medium">
            <EstadoProximoPago
              fecha={fila.proximaFechaEstimadaPago}
              vencido={fila.proximoPagoVencido}
              tieneSaldo={tieneSaldo}
            />
          </dd>
        </div>
      </dl>
    </Card>
  )
}
