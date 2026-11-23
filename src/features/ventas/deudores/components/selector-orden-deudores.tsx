import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { EtiquetaFiltro, type VarianteFiltro } from '@/features/ventas/components/etiqueta-filtro'
import type { CriterioOrdenDeudores, SentidoOrden } from '@/features/ventas/deudores/types/cuenta-corriente'
import type { OpcionSelector } from '@/features/ventas/types/compartidos'

/** Props del selector de orden de la lista de Deudores. */
interface SelectorOrdenDeudoresProps {
  idCampo: string
  /** barra: sin etiqueta visible, las opciones dicen "Ordenar por...". hoja: con etiqueta "Ordenar por". */
  variante: VarianteFiltro
  ordenarPor: CriterioOrdenDeudores
  sentido: SentidoOrden
  onCambiarOrden: (criterio: CriterioOrdenDeudores) => void
  onInvertirSentido: () => void
}

const OPCIONES_ORDEN: OpcionSelector<CriterioOrdenDeudores>[] = [
  { valor: 'NOMBRE', etiqueta: 'Nombre' },
  { valor: 'FIADOS_PENDIENTES', etiqueta: 'Fiados pendientes' },
  { valor: 'SALDO', etiqueta: 'Saldo' },
  { valor: 'FIADO_DESDE', etiqueta: 'Fecha de fiado' },
  { valor: 'PROXIMO_PAGO', etiqueta: 'Próximo pago' },
]

/**
 * Orden de la lista: un selector con el dato y un boton para invertir el sentido. Se usa un selector y no los
 * encabezados de la tabla porque las tarjetas de mobile no tienen encabezados.
 */
export function SelectorOrdenDeudores({
  idCampo,
  variante,
  ordenarPor,
  sentido,
  onCambiarOrden,
  onInvertirSentido,
}: SelectorOrdenDeudoresProps) {
  const ascendente = sentido === 'ASCENDENTE'
  const Icono = ascendente ? ArrowUpNarrowWide : ArrowDownWideNarrow
  const enBarra = variante === 'barra'

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <EtiquetaFiltro variante={variante} idCampo={idCampo}>
        Ordenar por
      </EtiquetaFiltro>
      <div className="flex gap-interno">
        <Select value={ordenarPor} onValueChange={(valor) => onCambiarOrden(valor as CriterioOrdenDeudores)}>
          <SelectTrigger
            id={idCampo}
            aria-label={enBarra ? 'Ordenar la lista' : undefined}
            className={cn('min-w-0 flex-1', enBarra && 'sm:w-64 sm:flex-none')}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPCIONES_ORDEN.map((opcion) => (
              <SelectItem key={opcion.valor} value={opcion.valor}>
                {enBarra ? `Ordenar por ${opcion.etiqueta.toLowerCase()}` : opcion.etiqueta}
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
    </div>
  )
}
