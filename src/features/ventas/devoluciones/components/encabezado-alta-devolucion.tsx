import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PasoAltaDevolucion } from '@/features/ventas/devoluciones/types/devolucion'
import { cn } from '@/lib/utils'

const PASOS: Array<{ paso: PasoAltaDevolucion; nombre: string }> = [
  { paso: 'MOTIVO', nombre: 'Motivo' },
  { paso: 'VENTA_ORIGINAL', nombre: 'Venta original' },
  { paso: 'ARTICULOS', nombre: 'Artículos' },
  { paso: 'COBRO', nombre: 'Cobro y confirmación' },
]

/** Props del encabezado del alta con el indicador de pasos. */
interface EncabezadoAltaDevolucionProps {
  paso: PasoAltaDevolucion
}

/** Titulo del modal y "Paso 2 de 3 · Artículos", con una barra por paso (la actual, resaltada). */
export function EncabezadoAltaDevolucion({ paso }: EncabezadoAltaDevolucionProps) {
  const indiceActual = PASOS.findIndex((candidato) => candidato.paso === paso)

  return (
    <DialogHeader>
      <DialogTitle>Cargar nueva devolución</DialogTitle>
      <DialogDescription className="tabular-nums">
        Paso {indiceActual + 1} de {PASOS.length} · {PASOS[indiceActual].nombre}
      </DialogDescription>
      {/* Decorativo: el texto de arriba ya dice en que paso se esta */}
      <ol aria-hidden="true" className="mt-2 grid grid-cols-4 gap-1.5">
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
