import { Navigate } from 'react-router'
import { RUTAS_REGISTRAR_VENTA } from '@/features/ventas/config/rutas-registrar-venta'
import { ContenedorCobroConDeuda } from '@/features/ventas/deudores/paginas/contenedor-cobro-con-deuda'
import { useContextoRegistrarVenta } from '@/features/ventas/hooks/use-contexto-registrar-venta'
import { useNavegacionRegistrarVenta } from '@/features/ventas/hooks/use-navegacion-registrar-venta'

/**
 * Ruta del paso de pago de Registrar Venta. El cobro con deuda atiende los dos casos: con deuda registra el fiado y,
 * si se pago algo, su pago inicial; sin deuda es la venta de contado de siempre, que se confirma con el cobro real.
 */
export function PaginaRegistrarVentaCobro() {
  const contexto = useContextoRegistrarVenta()
  const { propiedadesCarrito, registro, descartarRechazoEnvio, iniciarNuevaVenta } = contexto
  const { irAlCarrito } = useNavegacionRegistrarVenta()

  // Con la venta ya registrada no se puede volver a cobrar: solo queda el comprobante
  if (registro) return <Navigate to={RUTAS_REGISTRAR_VENTA.comprobante} replace />
  // Acceso directo invalido: no se cobra un carrito vacio
  if (propiedadesCarrito.estadoVenta.articulos.length === 0) {
    return <Navigate to={RUTAS_REGISTRAR_VENTA.carrito} replace />
  }

  const volverAlCarrito = () => {
    // El mensaje de un rechazo describia el cobro tal como estaba: al volver a corregir ya no corresponde
    descartarRechazoEnvio()
    irAlCarrito()
  }
  const cancelarVenta = () => {
    // Descarta carrito y cobro sin llamar al back; el reinicio vuelve a pedir el catalogo
    iniciarNuevaVenta()
    irAlCarrito()
  }

  return (
    <ContenedorCobroConDeuda
      contexto={contexto}
      onVolverAlCarrito={volverAlCarrito}
      onCancelarVenta={cancelarVenta}
      onNuevaVenta={cancelarVenta}
    />
  )
}
