import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PasoAltaCambio } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { cn } from '@/lib/utils'

const PASOS: Array<{ paso: PasoAltaCambio; nombre: string }> = [
  { paso: 'VENTA_ORIGINAL', nombre: 'Venta original' },
  { paso: 'ARTICULOS', nombre: 'Artículos' },
  { paso: 'COBRO', nombre: 'Cobro y confirmación' },
]

/** Props del encabezado del alta con el indicador de pasos. */
interface EncabezadoAltaCambioProps {
  paso: PasoAltaCambio
}

/** Titulo del modal y "Paso 2 de 3 · Artículos", con una barra por paso (la actual, resaltada). */
export function EncabezadoAltaCambio({ paso }: EncabezadoAltaCambioProps) {
  const indiceActual = PASOS.findIndex((candidato) => candidato.paso === paso)

  return (
    <DialogHeader>
      <DialogTitle>Cargar nuevo cambio</DialogTitle>
      <DialogDescription className="tabular-nums">
        Paso {indiceActual + 1} de {PASOS.length} · {PASOS[indiceActual].nombre}
      </DialogDescription>
      {/* Decorativo: el texto de arriba ya dice en que paso se esta */}
      <ol aria-hidden="true" className="mt-2 grid grid-cols-3 gap-1.5">
        {PASOS.map((elemento, indice) => (
          <li
            key={elemento.paso}
            className={cn('h-1.5 rounded-full', indice <= indiceActual ? 'bg-texto-principal' : 'bg-borde')}
          />
        ))}
      </ol>
    </DialogHeader>
  )
}
