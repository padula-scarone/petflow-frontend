import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EtiquetaFiltro, type VarianteFiltro } from '@/features/ventas/components/etiqueta-filtro'
import type { OpcionSelector } from '@/features/ventas/types/compartidos'

/** Props de un filtro de lista cerrada de opciones (estado, vinculo...), con una opcion "todos". */
interface FiltroSelectorProps<Valor extends string> {
  idCampo: string
  variante: VarianteFiltro
  /** Texto de la etiqueta en la hoja y de aria-label en la barra, por ejemplo "Estado". */
  etiqueta: string
  /** Texto de la opcion que quita el filtro, por ejemplo "Todos los estados". */
  etiquetaTodos: string
  opciones: OpcionSelector<Valor>[]
  valor: Valor | null
  onCambiarValor: (valor: Valor | null) => void
}

export function FiltroSelector<Valor extends string>({
  idCampo,
  variante,
  etiqueta,
  etiquetaTodos,
  opciones,
  valor,
  onCambiarValor,
}: FiltroSelectorProps<Valor>) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <EtiquetaFiltro variante={variante} idCampo={idCampo}>
        {etiqueta}
      </EtiquetaFiltro>
      <Select
        value={valor ?? 'TODOS'}
        onValueChange={(seleccionado) =>
          onCambiarValor(seleccionado === 'TODOS' ? null : (seleccionado as Valor))
        }
      >
        <SelectTrigger id={idCampo} aria-label={variante === 'barra' ? etiqueta : undefined}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TODOS">{etiquetaTodos}</SelectItem>
          {opciones.map((opcion) => (
            <SelectItem key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
