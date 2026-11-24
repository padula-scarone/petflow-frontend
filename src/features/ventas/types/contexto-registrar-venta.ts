import type { PropiedadesCobroRegistrarVenta } from '@/features/ventas/types/cobro'
import type { EstadoComprobanteVenta } from '@/features/ventas/types/comprobante'
import type { RegistroVenta } from '@/features/ventas/types/registro-venta'
import type {
  ErroresDatosEnvio,
  PropiedadesEntrega,
  RegistrarVentaCarritoProps,
} from '@/features/ventas/types/venta'

/** Props del carrito sin la navegacion a Cobro. */
export type PropiedadesCarrito = Omit<RegistrarVentaCarritoProps, 'onContinuarACobro'>

/** Estado de la venta en curso, compartido entre las tres rutas de Registrar Venta. */
export interface ContextoRegistrarVenta {
  propiedadesCarrito: PropiedadesCarrito
  propiedadesCobro: PropiedadesCobroRegistrarVenta
  /** Entrega de la venta (Retiro o Envio y sus datos): se elige en el cobro. */
  propiedadesEntrega: PropiedadesEntrega
  /** null hasta que el back confirma el alta; desde entonces la venta existe y no se puede volver a confirmar. */
  registro: RegistroVenta | null
  /** null mientras no hay registro. */
  estadoComprobante: EstadoComprobanteVenta | null
  /** Repite solo el pedido del detalle de la venta ya registrada. */
  onReintentarComprobante: () => void
  /** Envia la venta al back. Si el back confirma el alta, `registro` deja de ser null. */
  confirmarCobro: () => Promise<void>
  /** Borra el mensaje de un rechazo del back, por ejemplo al volver al carrito a corregir. */
  descartarRechazoEnvio: () => void
  /** Valida los datos del envio antes de confirmar: true si se puede seguir, false si hay algo que corregir (queda marcado). */
  validarDatosEnvio: () => boolean
  /** Marca en los campos de la entrega lo que el back rechazo de los datos del envio (tambien lo usa el fiado). */
  mostrarErroresDatosEnvio: (errores: ErroresDatosEnvio) => void
  /** Descarta toda la venta (carrito, cobro y comprobante) y empieza una vacia, sin llamar al back. */
  iniciarNuevaVenta: () => void
}
