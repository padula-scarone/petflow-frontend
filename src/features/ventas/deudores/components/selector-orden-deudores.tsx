import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { EtiquetaFiltro, type VarianteFiltro } from '@/features/ventas/components/etiqueta-filtro'
import type { CriterioOrdenDeudores, SentidoOrden } from '@/features/ventas/deudores/types/cuenta-corriente'
import { describirSentidoOrden } from '@/features/ventas/deudores/utils/describir-sentido-orden'
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
 * En la barra de escritorio el boton es solo el icono, con un tooltip que dice como queda ordenada la lista. En la hoja
 * de mobile no hay tooltip: el boton ocupa su propia fila y lleva ese mismo texto a la vista.
 */
export function SelectorOrdenDeudores({
  idCampo,
  variante,
  ordenarPor,
  sentido,
  onCambiarOrden,
  onInvertirSentido,
}: SelectorOrdenDeudoresProps) {
  const Icono = sentido === 'ASCENDENTE' ? ArrowUpNarrowWide : ArrowDownWideNarrow
  const enBarra = variante === 'barra'
  const descripcionSentido = describirSentidoOrden(ordenarPor, sentido)
  const nombreAccesibleBoton = `Invertir el orden. Ahora: ${descripcionSentido}`

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <EtiquetaFiltro variante={variante} idCampo={idCampo}>
        Ordenar por
      </EtiquetaFiltro>
      <div className={cn('flex gap-interno', !enBarra && 'flex-col')}>
        <Select value={ordenarPor} onValueChange={(valor) => onCambiarOrden(valor as CriterioOrdenDeudores)}>
          <SelectTrigger
            id={idCampo}
            aria-label={enBarra ? 'Ordenar la lista' : undefined}
            // flex-1 solo en la fila de la barra: en la columna de la hoja le aplastaba la altura
            className={cn('min-w-0', enBarra ? 'flex-1 sm:w-64 sm:flex-none' : 'w-full')}
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

        {enBarra ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                aria-label={nombreAccesibleBoton}
                className="size-control shrink-0 bg-fondo-tarjeta"
                onClick={onInvertirSentido}
              >
                <Icono aria-hidden="true" className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{descripcionSentido}</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            type="button"
            variant="outline"
            aria-label={nombreAccesibleBoton}
            className="w-full justify-start gap-2 bg-fondo-tarjeta px-3 font-normal"
            onClick={onInvertirSentido}
          >
            <Icono aria-hidden="true" className="size-5 shrink-0" />
            {descripcionSentido}
          </Button>
        )}
      </div>
    </div>
  )
}
