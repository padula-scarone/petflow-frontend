import { Navigate } from 'react-router'
import { ComprobanteSinDetalle } from '@/features/ventas/components/comprobante-sin-detalle'
import { RegistrarVentaComprobante } from '@/features/ventas/components/registrar-venta-comprobante'
import { RUTAS_REGISTRAR_VENTA } from '@/features/ventas/config/rutas-registrar-venta'
import { useContextoRegistrarVenta } from '@/features/ventas/hooks/use-contexto-registrar-venta'
import { useNavegacionRegistrarVenta } from '@/features/ventas/hooks/use-navegacion-registrar-venta'

export function PaginaRegistrarVentaComprobante() {
  const { estadoComprobante, onReintentarComprobante, iniciarNuevaVenta } =
    useContextoRegistrarVenta()
  const { irAlCarrito, irAEditarEnHistorial } = useNavegacionRegistrarVenta()

  // Acceso directo invalido (ej. recargar): sin venta registrada no hay comprobante que mostrar
  if (!estadoComprobante) return <Navigate to={RUTAS_REGISTRAR_VENTA.carrito} replace />

  const empezarNuevaVenta = () => {
    // Reinicia sin llamar al back; el reinicio vuelve a pedir el catalogo porque el stock cambio
    iniciarNuevaVenta()
    irAlCarrito()
  }

  // Con la venta ya registrada, aunque el detalle todavia no haya llegado o haya fallado
  if (estadoComprobante.fase !== 'listo') {
    return (
      <ComprobanteSinDetalle
        estado={estadoComprobante}
        onReintentar={onReintentarComprobante}
        onNuevaVenta={empezarNuevaVenta}
      />
    )
  }

  return (
    <RegistrarVentaComprobante
      comprobante={estadoComprobante.comprobante}
      enlaceWhatsApp={estadoComprobante.enlaceWhatsApp}
      enlaceMail={estadoComprobante.enlaceMail}
      edicionDisponible={estadoComprobante.edicionDisponible}
      fechaHoraLimiteEdicion={estadoComprobante.fechaHoraLimiteEdicion}
      onEditarVenta={() => irAEditarEnHistorial(estadoComprobante.comprobante.idVenta)}
      onNuevaVenta={empezarNuevaVenta}
    />
  )
}
