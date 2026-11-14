import { Navigate } from 'react-router'
import { RegistrarVentaCobro } from '@/features/ventas/components/registrar-venta-cobro'
import { RUTAS_REGISTRAR_VENTA } from '@/features/ventas/config/rutas-registrar-venta'
import { useContextoRegistrarVenta } from '@/features/ventas/hooks/use-contexto-registrar-venta'
import { useNavegacionRegistrarVenta } from '@/features/ventas/hooks/use-navegacion-registrar-venta'

export function PaginaRegistrarVentaCobro() {
  const {
    propiedadesCarrito,
    propiedadesCobro,
    registro,
    confirmarCobro,
    descartarRechazoEnvio,
    iniciarNuevaVenta,
  } = useContextoRegistrarVenta()
  const { irAlCarrito } = useNavegacionRegistrarVenta()

  // Con la venta ya registrada no se puede volver a cobrar: solo queda el comprobante
  if (registro) return <Navigate to={RUTAS_REGISTRAR_VENTA.comprobante} replace />
  // Acceso directo invalido: no se cobra un carrito vacio
  if (propiedadesCarrito.estadoVenta.articulos.length === 0) {
    return <Navigate to={RUTAS_REGISTRAR_VENTA.carrito} replace />
  }

  return (
    <RegistrarVentaCobro
      {...propiedadesCobro}
      onVolverAlCarrito={() => {
        // El mensaje de un rechazo describia el cobro tal como estaba: al volver a corregir ya no corresponde
        descartarRechazoEnvio()
        irAlCarrito()
      }}
      onCancelarVenta={() => {
        // Descarta carrito y cobro sin llamar al back; el reinicio vuelve a pedir el catalogo
        iniciarNuevaVenta()
        irAlCarrito()
      }}
      // Al confirmarse el alta, `registro` deja de ser null y esta misma pagina redirige al comprobante;
      // ante un rechazo o una duda se queda mostrando el motivo
      onConfirmarCobro={() => void confirmarCobro()}
    />
  )
}
