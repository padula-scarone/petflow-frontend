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

/**
 * Tarjeta de un deudor, con la misma estructura que las del Historial y Devoluciones: cabecera con el nombre en
 * negrita, datos con etiqueta, el importe a la derecha bajo una linea y un boton de ancho completo. La ficha se
 * abre con el boton "Ver ficha".
 */
export function TarjetaDeudor({ fila, onAbrirFicha }: TarjetaDeudorProps) {
  const tieneSaldo = fila.saldo > 0

  return (
    // h-full + mt-auto en el saldo: las tarjetas de una misma fila de la grilla igualan alto
    <Card className="h-full min-w-0 gap-interno p-contorno">
      {/* --- NOMBRE, DNI Y TELEFONO --- */}
      <div className="min-w-0">
        <p className="font-bold wrap-break-word">{fila.nombreCompleto}</p>
        <p className="text-cuerpo text-texto-suave tabular-nums">DNI: {fila.dni}</p>
        <p className="text-cuerpo text-texto-suave tabular-nums">Teléfono: {fila.telefono}</p>
      </div>

      {/* --- FIADOS, FECHA DE FIADO Y PROXIMO PAGO --- */}
      <dl className="grid grid-cols-2 gap-x-bloque gap-y-interno text-cuerpo">
        <div>
          <dt className="text-auxiliar text-texto-suave">Fiados pendientes</dt>
          <dd className="font-medium tabular-nums">{fila.cantidadFiadosPendientes}</dd>
        </div>
        <div>
          <dt className="text-auxiliar text-texto-suave">Fecha de fiado</dt>
          <dd className="font-medium tabular-nums">
            {fila.fiadoDesde === null ? <span className="text-texto-suave">—</span> : formatearFecha(fila.fiadoDesde)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-auxiliar text-texto-suave">Próximo pago</dt>
          <dd className="font-medium">
            <EstadoProximoPago
              fecha={fila.proximaFechaEstimadaPago}
              vencido={fila.proximoPagoVencido}
              tieneSaldo={tieneSaldo}
              disposicion="en-linea"
            />
          </dd>
        </div>
      </dl>

      {/* --- SALDO, A LA DERECHA --- */}
      <div className="mt-auto flex justify-end border-t pt-interno">
        <p className="flex flex-col items-end">
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

      {/* --- ACCION --- */}
      <Button
        type="button"
        variant="outline"
        aria-label={`Ver la ficha de ${fila.nombreCompleto}`}
        className="w-full gap-1.5 bg-fondo-tarjeta px-2"
        onClick={() => onAbrirFicha(fila.idDeudor)}
      >
        <FileText />
        Ver ficha
      </Button>
    </Card>
  )
}
