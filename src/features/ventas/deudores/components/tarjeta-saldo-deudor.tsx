import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props de la tarjeta con el saldo total de un deudor. */
interface TarjetaSaldoDeudorProps {
  saldo: number
  cantidadFiadosPendientes: number
}

/** El saldo total que debe, en grande: es lo primero que se mira en la ficha. */
export function TarjetaSaldoDeudor({ saldo, cantidadFiadosPendientes }: TarjetaSaldoDeudorProps) {
  const debe = saldo > 0

  return (
    <Card className="justify-center gap-1 p-contorno">
      <h2 className="text-cuerpo text-texto-suave">Saldo total</h2>
      <p
        className={cn(
          'text-cifra-principal font-bold tabular-nums',
          debe ? 'text-amber-700' : 'text-texto-suave',
        )}
      >
        {formatearMoneda(saldo)}
      </p>
      <p className="text-cuerpo text-texto-suave">
        {debe
          ? `${cantidadFiadosPendientes} ${cantidadFiadosPendientes === 1 ? 'fiado pendiente' : 'fiados pendientes'}`
          : 'No debe nada'}
      </p>
    </Card>
  )
}
