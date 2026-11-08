import { RegistrarVentaCarrito } from '@/features/ventas/components/registrar-venta-carrito'
import { useContextoRegistrarVenta } from '@/features/ventas/hooks/use-contexto-registrar-venta'
import { useNavegacionRegistrarVenta } from '@/features/ventas/hooks/use-navegacion-registrar-venta'

export function PaginaRegistrarVentaCarrito() {
  const { propiedadesCarrito } = useContextoRegistrarVenta()
  const { irAlCobro } = useNavegacionRegistrarVenta()

  return <RegistrarVentaCarrito {...propiedadesCarrito} onContinuarACobro={irAlCobro} />
}
