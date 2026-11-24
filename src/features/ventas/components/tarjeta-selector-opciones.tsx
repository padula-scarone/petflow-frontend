import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  CLASE_GRUPO_SELECTOR,
  CLASE_OPCION_SELECTOR,
} from '@/features/ventas/config/clases-selector-opciones'

/** Una opcion del selector. */
export interface OpcionSelector<Valor extends string> {
  valor: Valor
  etiqueta: string
}

/** Props de la tarjeta con un selector de opciones. */
interface TarjetaSelectorOpcionesProps<Valor extends string> {
  /** Distingue los titulos de varias tarjetas en la misma pantalla (lo usa el lector de pantalla). */
  idTitulo: string
  titulo: string
  opciones: OpcionSelector<Valor>[]
  valor: Valor
  onCambiar: (valor: Valor) => void
  /** Verdadero mientras la venta viaja al back: no se cambia nada. */
  deshabilitado?: boolean
  /** Lo que depende de la opcion elegida; va debajo del selector. */
  children?: ReactNode
}

/**
 * Tarjeta con el titulo arriba y, debajo, un selector que ocupa todo el ancho de la tarjeta, con las opciones del
 * mismo tamano. Canal (carrito) y Entrega (cobro) lo usan, asi se ven igual en todas las pantallas.
 */
export function TarjetaSelectorOpciones<Valor extends string>({
  idTitulo,
  titulo,
  opciones,
  valor,
  onCambiar,
  deshabilitado = false,
  children,
}: TarjetaSelectorOpcionesProps<Valor>) {
  return (
    <Card className="gap-bloque p-contorno">
      <div className="flex flex-col gap-interno">
        <h2 id={idTitulo} className="text-titulo-seccion font-bold">
          {titulo}
        </h2>
        <ToggleGroup
          type="single"
          aria-labelledby={idTitulo}
          className={CLASE_GRUPO_SELECTOR}
          value={valor}
          disabled={deshabilitado}
          // Radix emite '' al des-seleccionar; el selector siempre debe tener valor
          onValueChange={(nuevoValor) => {
            if (nuevoValor) onCambiar(nuevoValor as Valor)
          }}
        >
          {opciones.map((opcion) => (
            <ToggleGroupItem key={opcion.valor} value={opcion.valor} className={CLASE_OPCION_SELECTOR}>
              {opcion.etiqueta}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      {children}
    </Card>
  )
}
