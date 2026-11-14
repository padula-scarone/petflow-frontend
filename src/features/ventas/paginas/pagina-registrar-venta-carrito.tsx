import { Navigate } from 'react-router'
import { RegistrarVentaCarrito } from '@/features/ventas/components/registrar-venta-carrito'
import { RUTAS_REGISTRAR_VENTA } from '@/features/ventas/config/rutas-registrar-venta'
import { useContextoRegistrarVenta } from '@/features/ventas/hooks/use-contexto-registrar-venta'
import { useNavegacionRegistrarVenta } from '@/features/ventas/hooks/use-navegacion-registrar-venta'

export function PaginaRegistrarVentaCarrito() {
  const { propiedadesCarrito, registro } = useContextoRegistrarVenta()
  const { irAlCobro } = useNavegacionRegistrarVenta()

  // Con la venta ya registrada no se puede volver a editar ni a cobrar: solo queda el comprobante
  if (registro) return <Navigate to={RUTAS_REGISTRAR_VENTA.comprobante} replace />

  return <RegistrarVentaCarrito {...propiedadesCarrito} onContinuarACobro={irAlCobro} />
}
