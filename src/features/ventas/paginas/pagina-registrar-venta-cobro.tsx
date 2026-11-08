import { Navigate } from 'react-router'
import { RegistrarVentaCobro } from '@/features/ventas/components/registrar-venta-cobro'
import { RUTAS_REGISTRAR_VENTA } from '@/features/ventas/config/rutas-registrar-venta'
import { useContextoRegistrarVenta } from '@/features/ventas/hooks/use-contexto-registrar-venta'
import { useNavegacionRegistrarVenta } from '@/features/ventas/hooks/use-navegacion-registrar-venta'

export function PaginaRegistrarVentaCobro() {
  const { propiedadesCarrito, propiedadesCobro, confirmarCobro } = useContextoRegistrarVenta()
  const { irAlCarrito, irAlComprobante } = useNavegacionRegistrarVenta()

  // Acceso directo invalido: no se cobra un carrito vacio
  if (propiedadesCarrito.estadoVenta.articulos.length === 0) {
    return <Navigate to={RUTAS_REGISTRAR_VENTA.carrito} replace />
  }

  return (
    <RegistrarVentaCobro
      {...propiedadesCobro}
      onVolverAlCarrito={irAlCarrito}
      onCancelarVenta={irAlCarrito}
      onConfirmarCobro={() => {
        confirmarCobro()
        irAlComprobante()
      }}
    />
  )
}
