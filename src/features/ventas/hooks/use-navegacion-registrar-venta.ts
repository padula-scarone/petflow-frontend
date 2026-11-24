import { useNavigate } from 'react-router'
import { RUTAS_REGISTRAR_VENTA } from '@/features/ventas/config/rutas-registrar-venta'

/**
 * Transiciones entre las pantallas de Registrar Venta.
 * Solo avanzar a Cobro agrega una entrada al historial; el resto reemplaza la actual, asi el
 * boton atras no vuelve a un cobro ya confirmado ni a un cobro cancelado.
 */
export function useNavegacionRegistrarVenta() {
  const navegar = useNavigate()

  return {
    irAlCobro: () => navegar(RUTAS_REGISTRAR_VENTA.cobro),
    irAlCarrito: () => navegar(RUTAS_REGISTRAR_VENTA.carrito, { replace: true }),
    irAlComprobante: () => navegar(RUTAS_REGISTRAR_VENTA.comprobante, { replace: true }),
  }
}
