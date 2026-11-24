import { RegistrarVentaCobroConDeuda } from '@/features/ventas/deudores/components/registrar-venta-cobro-con-deuda'
import { RegistrarVentaComprobanteConDeuda } from '@/features/ventas/deudores/components/registrar-venta-comprobante-con-deuda'
import { usePagoConDeuda } from '@/features/ventas/deudores/hooks/use-pago-con-deuda'
import {
  construirEnlaceMailConTexto,
  construirEnlaceWhatsAppConTexto,
  construirTextoComprobanteConDeuda,
} from '@/features/ventas/deudores/utils/construir-enlaces-deudores'
import type { ContextoRegistrarVenta } from '@/features/ventas/types/contexto-registrar-venta'

/** Props del contenedor del cobro con deuda. */
interface ContenedorCobroConDeudaProps {
  /** La venta en curso: de ella salen el carrito, el cobro de siempre y la confirmacion de una venta de contado. */
  contexto: ContextoRegistrarVenta
  onVolverAlCarrito: () => void
  onCancelarVenta: () => void
  /** Descarta la venta y vuelve al carrito vacio, despues de ver el comprobante. */
  onNuevaVenta: () => void
}

/**
 * Conecta el paso de pago con deuda con la venta en curso. Mientras la venta no se registra con deuda muestra el
 * cobro; al registrarse, el comprobante de la deuda. La venta de contado no pasa por aca: va al back real y la
 * pagina de siempre la lleva al comprobante.
 */
export function ContenedorCobroConDeuda({
  contexto,
  onVolverAlCarrito,
  onCancelarVenta,
  onNuevaVenta,
}: ContenedorCobroConDeudaProps) {
  const { estadoVenta } = contexto.propiedadesCarrito
  const { propiedadesEntrega } = contexto
  const { propiedadesPago, comprobante } = usePagoConDeuda({
    articulos: estadoVenta.articulos,
    canalVenta: estadoVenta.canalVenta,
    tipoEntrega: propiedadesEntrega.tipoEntrega,
    direccionEnvio: propiedadesEntrega.direccionEnvio,
    destinatarioEnvio: propiedadesEntrega.destinatarioEnvio,
    validarDatosEnvio: contexto.validarDatosEnvio,
    alRechazarDatosEnvio: contexto.mostrarErroresDatosEnvio,
    propiedadesCobro: contexto.propiedadesCobro,
    confirmarCobro: contexto.confirmarCobro,
    alAbandonarVenta: onNuevaVenta,
  })

  if (comprobante) {
    const texto = construirTextoComprobanteConDeuda(comprobante)
    return (
      <RegistrarVentaComprobanteConDeuda
        comprobante={comprobante}
        enlaceWhatsApp={construirEnlaceWhatsAppConTexto(texto)}
        enlaceMail={construirEnlaceMailConTexto(`PetFlow - Comprobante ${comprobante.numeroComprobante}`, texto)}
        onNuevaVenta={onNuevaVenta}
      />
    )
  }

  return (
    <RegistrarVentaCobroConDeuda
      propiedadesPago={propiedadesPago}
      propiedadesCobro={contexto.propiedadesCobro}
      propiedadesEntrega={propiedadesEntrega}
      onVolverAlCarrito={onVolverAlCarrito}
      onCancelarVenta={onCancelarVenta}
    />
  )
}
