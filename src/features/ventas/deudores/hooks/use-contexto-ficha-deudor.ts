import { useOutletContext } from 'react-router'
import type { useFichaDeudorEjemplo } from '@/features/ventas/deudores/hooks/use-ficha-deudor-ejemplo'
import type { useSeleccionFiados } from '@/features/ventas/deudores/hooks/use-seleccion-fiados'

/**
 * Lo que la ficha de un deudor comparte con su pantalla de cobro: la cuenta y los fiados tildados. Vive en el layout,
 * asi la seleccion no se pierde al ir al cobro y volver.
 */
export interface ContextoFichaDeudor {
  idDeudor: number
  ficha: ReturnType<typeof useFichaDeudorEjemplo>
  seleccion: ReturnType<typeof useSeleccionFiados>
}

/** Accede al estado que provee LayoutFichaDeudor a sus rutas hijas. */
export function useContextoFichaDeudor(): ContextoFichaDeudor {
  return useOutletContext<ContextoFichaDeudor>()
}
