import type { EstadoPagoConDeuda } from '@/features/ventas/deudores/types/pago-con-deuda'
import type { DescuentoManual } from '@/features/ventas/types/cobro'
import type {
  PagoResumenVenta,
  ResumenConfirmacionVenta,
} from '@/features/ventas/types/resumen-confirmacion-venta'
import type { ArticuloCarrito, CanalVenta, TipoEntrega } from '@/features/ventas/types/venta'
import { listarDatosEnvio } from '@/features/ventas/utils/listar-datos-envio'

/** Lo que hace falta para armar el resumen que se revisa antes de registrar la venta. */
interface DatosResumenConfirmacion {
  articulos: ArticuloCarrito[]
  canalVenta: CanalVenta
  tipoEntrega: TipoEntrega
  /** Tal como los escribio el vendedor: aca se recortan, igual que en la solicitud. */
  direccionEnvio: string
  destinatarioEnvio: string
  descuentoManual: DescuentoManual | null
  estadoPago: EstadoPagoConDeuda
}

/** Un texto vacio no es un dato: se omite en lugar de dejar una fila sin valor. */
const recortarOmitiendoVacio = (texto: string) => (texto.trim() === '' ? null : texto.trim())

/** Los pagos que se cobran ahora: uno por medio, con lo recibido y el vuelto solo si el medio los admite. */
function construirPagos(estadoPago: EstadoPagoConDeuda): PagoResumenVenta[] {
  if (estadoPago.fiarTodo) return []

  if (estadoPago.formaPago === 'unico') {
    const medio = estadoPago.mediosDisponibles.find((candidato) => candidato.idMedioPago === estadoPago.idMedioSeleccionado)
    if (medio === undefined) return []
    return [
      {
        idMedioPago: medio.idMedioPago,
        nombreMedioPago: medio.nombre,
        montoBase: estadoPago.resumen.pagadoAhoraBase,
        montoAjuste: estadoPago.resumen.ajusteMediosPago,
        montoRecibido: medio.admiteVuelto ? estadoPago.pagaCon : null,
        vuelto: medio.admiteVuelto ? estadoPago.vuelto : null,
      },
    ]
  }

  return estadoPago.lineasPagoMixto.flatMap((linea) => {
    const medio = estadoPago.mediosDisponibles.find((candidato) => candidato.idMedioPago === linea.idMedioPago)
    if (medio === undefined) return []
    return [
      {
        idMedioPago: medio.idMedioPago,
        nombreMedioPago: medio.nombre,
        montoBase: linea.montoACubrir ?? 0,
        montoAjuste: linea.montoAjuste,
        montoRecibido: medio.admiteVuelto ? linea.pagaCon : null,
        vuelto: medio.admiteVuelto ? linea.vuelto : null,
      },
    ]
  })
}

/** Junta lo que se muestra en la confirmacion de la venta: productos, entrega, descuento y medios de pago. */
export function construirResumenConfirmacionVenta({
  articulos,
  canalVenta,
  tipoEntrega,
  direccionEnvio,
  destinatarioEnvio,
  descuentoManual,
  estadoPago,
}: DatosResumenConfirmacion): ResumenConfirmacionVenta {
  return {
    productos: articulos.map((articulo) => ({
      idProducto: articulo.idProducto,
      nombreProducto: articulo.nombreProducto,
      formato: articulo.formato,
      cantidad: articulo.cantidad,
      montoTotal: articulo.montoTotal,
    })),
    canalVenta,
    tipoEntrega,
    datosEnvio: listarDatosEnvio(
      tipoEntrega === 'envio',
      recortarOmitiendoVacio(direccionEnvio),
      recortarOmitiendoVacio(destinatarioEnvio),
    ),
    descuentoManual:
      descuentoManual === null
        ? null
        : { monto: descuentoManual.montoDescontado, motivo: descuentoManual.motivo.trim() },
    pagos: construirPagos(estadoPago),
  }
}
