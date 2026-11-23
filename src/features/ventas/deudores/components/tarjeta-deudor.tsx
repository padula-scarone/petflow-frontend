import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatearFecha } from '@/lib/formatear-fecha-hora'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { EstadoProximoPago } from '@/features/ventas/deudores/components/estado-proximo-pago'
import type { FilaDeudor } from '@/features/ventas/deudores/types/cuenta-corriente'

/** Props de la tarjeta de un deudor (mobile y pantallas medianas). */
interface TarjetaDeudorProps {
  fila: FilaDeudor
  onAbrirFicha: (idDeudor: number) => void
}

/** Tarjeta de un deudor. Como en el Historial, la ficha se abre con el boton "Ver ficha" del pie. */
export function TarjetaDeudor({ fila, onAbrirFicha }: TarjetaDeudorProps) {
  const tieneSaldo = fila.saldo > 0

  return (
    // h-full + mt-auto en el pie: las tarjetas de una misma fila de la grilla igualan alto
    <Card className="h-full min-w-0 gap-interno p-contorno">
      {/* --- NOMBRE, CONTACTO Y SALDO --- */}
      <div className="flex items-start justify-between gap-interno">
        <div className="min-w-0">
          <p className="truncate font-bold">{fila.nombreCompleto}</p>
          <p className="text-cuerpo text-texto-suave tabular-nums">{fila.telefono}</p>
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
      <dl className="flex flex-wrap justify-between gap-x-bloque gap-y-1 border-t pt-interno text-cuerpo">
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
        <div>
          <dt className="text-auxiliar text-texto-suave">Fiado desde</dt>
          <dd className="font-medium tabular-nums">
            {fila.fiadoDesde === null ? <span className="text-texto-suave">—</span> : formatearFecha(fila.fiadoDesde)}
          </dd>
        </div>
      </dl>

      {/* --- ACCION --- */}
      <Button
        type="button"
        variant="outline"
        aria-label={`Ver la ficha de ${fila.nombreCompleto}`}
        className="mt-auto w-full gap-1.5 bg-fondo-tarjeta px-2"
        onClick={() => onAbrirFicha(fila.idDeudor)}
      >
        <FileText />
        Ver ficha
      </Button>
    </Card>
  )
}
