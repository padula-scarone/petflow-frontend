import type { SolicitudVenta, DatosCobroSolicitud } from '@/features/ventas/types/solicitud-venta'
import type { ArticuloCarrito, CanalVenta, TipoEntrega } from '@/features/ventas/types/venta'
import { construirDatosEnvioSolicitud } from '@/features/ventas/utils/construir-datos-envio-solicitud'

/** Datos de la venta en curso que se necesitan para armar la solicitud. */
interface DatosVentaEnCurso {
  canalVenta: CanalVenta
  tipoEntrega: TipoEntrega
  /** Tal como los escribio el vendedor: aca se recortan y se descartan con Retiro. */
  direccionEnvio: string
  destinatarioEnvio: string
  articulos: ArticuloCarrito[]
  datosCobro: DatosCobroSolicitud
}

/** Une el carrito y el cobro en la solicitud que envia la capa api. No convierte nada: eso lo hace la api. */
export function construirSolicitudVenta({
  canalVenta,
  tipoEntrega,
  direccionEnvio,
  destinatarioEnvio,
  articulos,
  datosCobro,
}: DatosVentaEnCurso): SolicitudVenta {
  return {
    canalVenta,
    tipoEntrega,
    items: articulos.map((articulo) => ({
      idProducto: articulo.idProducto,
      cantidad: articulo.cantidad,
    })),
    ...datosCobro,
    ...construirDatosEnvioSolicitud(tipoEntrega, direccionEnvio, destinatarioEnvio),
  }
}
