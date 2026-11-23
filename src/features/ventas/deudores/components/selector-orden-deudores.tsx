import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { CriterioOrdenDeudores, SentidoOrden } from '@/features/ventas/deudores/types/cuenta-corriente'
import type { OpcionSelector } from '@/features/ventas/types/compartidos'

/** Props del selector de orden de la lista de Deudores. */
interface SelectorOrdenDeudoresProps {
  ordenarPor: CriterioOrdenDeudores
  sentido: SentidoOrden
  onCambiarOrden: (criterio: CriterioOrdenDeudores) => void
  onInvertirSentido: () => void
}

const OPCIONES_ORDEN: OpcionSelector<CriterioOrdenDeudores>[] = [
  { valor: 'NOMBRE', etiqueta: 'Ordenar por nombre' },
  { valor: 'FIADOS_PENDIENTES', etiqueta: 'Ordenar por fiados pendientes' },
  { valor: 'SALDO', etiqueta: 'Ordenar por saldo' },
  { valor: 'FIADO_DESDE', etiqueta: 'Ordenar por fecha de fiado' },
  { valor: 'PROXIMO_PAGO', etiqueta: 'Ordenar por próximo pago' },
]

/**
 * Orden de la lista: un selector con el dato y un boton para invertir el sentido. Se usa un selector y no los
 * encabezados de la tabla porque las tarjetas de mobile no tienen encabezados.
 */
export function SelectorOrdenDeudores({
  ordenarPor,
  sentido,
  onCambiarOrden,
  onInvertirSentido,
}: SelectorOrdenDeudoresProps) {
  const ascendente = sentido === 'ASCENDENTE'
  const Icono = ascendente ? ArrowUpNarrowWide : ArrowDownWideNarrow

  return (
    <div className="flex gap-interno">
      <Select value={ordenarPor} onValueChange={(valor) => onCambiarOrden(valor as CriterioOrdenDeudores)}>
        <SelectTrigger aria-label="Ordenar la lista" className="min-w-0 flex-1 sm:w-64 sm:flex-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPCIONES_ORDEN.map((opcion) => (
            <SelectItem key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            aria-label={`Invertir el orden. Ahora va de ${ascendente ? 'menor a mayor' : 'mayor a menor'}`}
            className="size-control shrink-0 bg-fondo-tarjeta"
            onClick={onInvertirSentido}
          >
            <Icono aria-hidden="true" className="size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{ascendente ? 'De menor a mayor' : 'De mayor a menor'}</TooltipContent>
      </Tooltip>
    </div>
  )
}
