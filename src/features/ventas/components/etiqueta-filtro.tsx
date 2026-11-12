import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'

/** Donde se muestra un control de filtro: la barra (compacta, sin etiquetas) o la hoja (con etiquetas). */
export type VarianteFiltro = 'barra' | 'hoja'

/** Props de la etiqueta de un control de filtro. */
interface EtiquetaFiltroProps {
  variante: VarianteFiltro
  idCampo: string
  children: ReactNode
}

/**
 * Etiqueta de un solo control. En la barra no se muestra: el control se entiende por su valor o su
 * placeholder y lleva su aria-label. En la hoja y en "Mas filtros" si, una por control.
 */
export function EtiquetaFiltro({ variante, idCampo, children }: EtiquetaFiltroProps) {
  if (variante === 'barra') return null
  return (
    <Label htmlFor={idCampo} className="text-sm font-medium">
      {children}
    </Label>
  )
}
