import { CircleCheck, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { MENSAJE_PRECIO_IGUAL_O_MAYOR } from '@/features/ventas/cambios-mercaderia/config/reglas-cambios'
import type { ResumenSaldoCambio } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { cn } from '@/lib/utils'

/** Props de la tarjeta con el saldo en vivo del cambio. */
interface TarjetaSaldoCambioProps {
  resumen: ResumenSaldoCambio
}

/**
 * Valor devuelto, valor entregado y saldo (entregado menos devuelto). Se actualiza al instante con cada dato.
 * Si el saldo daria negativo se explica la regla: no existen reembolsos.
 */
export function TarjetaSaldoCambio({ resumen }: TarjetaSaldoCambioProps) {
  const { valorDevuelto, valorEntregado, saldo, situacion } = resumen

  return (
    <Card className="gap-3 p-4 shadow-none" aria-label="Saldo del cambio">
      <dl className="grid gap-1.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-texto-suave">Valor entregado</dt>
          <dd className="tabular-nums">{formatearMoneda(valorEntregado)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-texto-suave">Valor devuelto</dt>
          <dd className="tabular-nums">− {formatearMoneda(valorDevuelto)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t pt-2">
          <dt className="font-bold">Saldo</dt>
          {/* role="status": el saldo se anuncia al cambiar, sin interrumpir */}
          <dd
            role="status"
            className={cn(
              'text-2xl font-bold tabular-nums',
              situacion === 'NEGATIVO' && 'text-peligro',
              situacion === 'INCOMPLETO' && 'text-texto-suave',
            )}
          >
            {situacion === 'INCOMPLETO' ? '—' : formatearMoneda(saldo)}
          </dd>
        </div>
      </dl>

      {situacion === 'A_COBRAR' && (
        <p className="text-sm text-texto-suave">El cliente abona la diferencia con un medio de pago.</p>
      )}
      {situacion === 'SIN_DIFERENCIA' && (
        <p className="flex items-center gap-1.5 text-sm text-texto-suave">
          <CircleCheck aria-hidden="true" className="size-4 text-green-700" />
          Mismo valor: no hay nada para cobrar.
        </p>
      )}
      {situacion === 'NEGATIVO' && (
        <Alert variant="destructive">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>No se puede confirmar</AlertTitle>
          <AlertDescription>
            <p>{MENSAJE_PRECIO_IGUAL_O_MAYOR}. No hay reembolsos: elegí un producto de al menos {formatearMoneda(valorDevuelto)}.</p>
          </AlertDescription>
        </Alert>
      )}
      {situacion === 'INCOMPLETO' && (
        <p className="text-sm text-texto-suave">Elegí los dos artículos y sus cantidades para ver el saldo.</p>
      )}
    </Card>
  )
}
