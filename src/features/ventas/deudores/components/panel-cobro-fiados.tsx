import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { BotonCobrarFiados } from '@/features/ventas/deudores/components/boton-cobrar-fiados'
import type { ResumenSeleccionFiados } from '@/features/ventas/deudores/types/cobro-deudor'

/** Props del panel con lo que se va a cobrar (escritorio). */
interface PanelCobroFiadosProps {
  resumen: ResumenSeleccionFiados
  cantidadFiados: number
  onCobrarFiados: () => void
  className?: string
}

/** Columna derecha de la ficha, como el resumen de Registrar Venta: cuantos fiados se eligieron, el total y COBRAR. */
export function PanelCobroFiados({ resumen, cantidadFiados, onCobrarFiados, className }: PanelCobroFiadosProps) {
  const { cantidadSeleccionados, totalACobrar, hayErrores, puedeCobrar } = resumen

  return (
    <Card className={cn('gap-bloque p-contorno xl:sticky xl:top-0', className)}>
      <dl className="flex flex-col gap-interno text-cuerpo">
        <div className="flex justify-between gap-interno">
          <dt className="text-texto-suave">Fiados elegidos</dt>
          <dd className="font-medium tabular-nums">
            {cantidadSeleccionados} de {cantidadFiados}
          </dd>
        </div>
      </dl>

      <p className="flex items-baseline justify-between gap-interno border-t pt-bloque">
        <span className="text-cuerpo text-texto-suave">A cobrar</span>
        <span className="text-cifra-principal font-bold tabular-nums">{formatearMoneda(totalACobrar)}</span>
      </p>

      <div className="flex flex-col gap-interno border-t pt-bloque">
        <BotonCobrarFiados habilitado={puedeCobrar} onCobrarFiados={onCobrarFiados} className="w-full" />
        {hayErrores && (
          <p role="status" className="text-center text-cuerpo text-peligro">
            Revisá los montos marcados
          </p>
        )}
      </div>
    </Card>
  )
}
