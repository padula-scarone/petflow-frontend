import { useOutletContext } from 'react-router'
import type { ContextoRegistrarVenta } from '@/features/ventas/types/contexto-registrar-venta'

/** Accede al estado de la venta que provee LayoutRegistrarVenta a sus rutas hijas. */
export function useContextoRegistrarVenta(): ContextoRegistrarVenta {
  return useOutletContext<ContextoRegistrarVenta>()
}
