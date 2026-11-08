import { Navigate } from 'react-router'
import { RegistrarVentaComprobante } from '@/features/ventas/components/registrar-venta-comprobante'
import { RUTAS_REGISTRAR_VENTA } from '@/features/ventas/config/rutas-registrar-venta'
import { useContextoRegistrarVenta } from '@/features/ventas/hooks/use-contexto-registrar-venta'
import { useNavegacionRegistrarVenta } from '@/features/ventas/hooks/use-navegacion-registrar-venta'
import {
  construirEnlaceMail,
  construirEnlaceWhatsApp,
} from '@/features/ventas/utils/construir-enlaces-comprobante'

// Tiempo que dura la ventana para editar una venta, segun SSOT.md
const MINUTOS_EDICION = 15

export function PaginaRegistrarVentaComprobante() {
  const { comprobante, iniciarNuevaVenta } = useContextoRegistrarVenta()
  const { irAlCarrito } = useNavegacionRegistrarVenta()

  // Acceso directo invalido (ej. recargar): sin venta confirmada no hay comprobante que mostrar
  if (!comprobante) return <Navigate to={RUTAS_REGISTRAR_VENTA.carrito} replace />

  return (
    <RegistrarVentaComprobante
      comprobante={comprobante}
      enlaceWhatsApp={construirEnlaceWhatsApp(comprobante)}
      enlaceMail={construirEnlaceMail(comprobante)}
      // Temporal: con ?edicionVencida en la URL se prueba el plazo vencido
      edicionDisponible={!window.location.search.includes('edicionVencida')}
      fechaHoraLimiteEdicion={new Date(
        new Date(comprobante.fechaHora).getTime() + MINUTOS_EDICION * 60 * 1000,
      ).toISOString()}
      onEditarVenta={irAlCarrito}
      onNuevaVenta={() => {
        irAlCarrito()
        iniciarNuevaVenta()
      }}
    />
  )
}
