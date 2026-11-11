import type { Comprobante, PagoComprobante } from '@/features/ventas/types/comprobante'
import type { EstadoCobro, MedioPago } from '@/features/ventas/types/cobro'
import type { ArticuloCarrito, CanalVenta, TipoEntrega } from '@/features/ventas/types/venta'

// Temporal: arma un comprobante de prueba con el carrito y el cobro de la vista de prueba.
// Se reemplaza por la respuesta real de la API cuando exista el hook de Registrar Venta.

function crearPago(
  medio: MedioPago,
  montoBase: number,
  montoAjuste: number,
  pagaCon: number | null,
  vuelto: number | null,
): PagoComprobante {
  const montoFinal = montoBase + montoAjuste
  const datosComunes = {
    idMedioPago: medio.idMedioPago,
    nombreMedioPago: medio.nombre,
    montoBase,
    porcentajeAjuste:
      medio.tipoAjuste === 'descuento'
        ? -medio.porcentajeAjuste
        : medio.tipoAjuste === 'recargo'
          ? medio.porcentajeAjuste
          : 0,
    montoAjuste,
    montoFinal,
  }
  return medio.admiteVuelto
    ? { ...datosComunes, admiteVuelto: true, montoRecibido: pagaCon ?? montoFinal, vuelto: vuelto ?? 0 }
    : { ...datosComunes, admiteVuelto: false }
}

export function crearComprobanteEjemplo(
  articulos: ArticuloCarrito[],
  estadoCobro: EstadoCobro,
  canalVenta: CanalVenta,
  tipoEntrega: TipoEntrega,
): Comprobante {
  const { resumen } = estadoCobro
  const datosComunes = {
    idVenta: '123',
    numeroComprobante: 'PF-000123',
    fechaHora: new Date().toISOString(),
    canalVenta,
    tipoEntrega,
    nombreVendedor: 'Usuario',
    detalles: articulos.map((articulo) => ({
      idProducto: articulo.idProducto,
      nombreProducto: articulo.nombreProducto,
      formato: articulo.formato,
      cantidad: articulo.cantidad,
      precioUnitario: articulo.precioUnitario,
      subtotal: articulo.montoTotal,
    })),
    descuentoManual: estadoCobro.descuentoManual
      ? {
          motivo: estadoCobro.descuentoManual.motivo,
          monto: estadoCobro.descuentoManual.montoDescontado,
        }
      : null,
    subtotalProductos: resumen.subtotalProductos,
    montoTotal: resumen.total,
  }

  if (estadoCobro.formaPago === 'fiado') {
    return {
      ...datosComunes,
      estado: 'pendiente-pago',
      clienteReferencia: estadoCobro.nombreClienteFiado.trim(),
    }
  }

  const medioUnico = estadoCobro.mediosDisponibles.find(
    (medio) => medio.idMedioPago === estadoCobro.idMedioSeleccionado,
  )
  const pagos: PagoComprobante[] =
    estadoCobro.formaPago === 'unico'
      ? medioUnico
        ? [
            crearPago(
              medioUnico,
              resumen.subtotalProductos - resumen.montoDescuentoManual,
              resumen.montoAjusteMediosPago,
              estadoCobro.pagaCon,
              estadoCobro.vuelto,
            ),
          ]
        : []
      : estadoCobro.lineasPagoMixto.flatMap((linea) => {
          const medio = estadoCobro.mediosDisponibles.find(
            (candidato) => candidato.idMedioPago === linea.idMedioPago,
          )
          return medio
            ? [crearPago(medio, linea.montoACubrir ?? 0, linea.montoAjuste, linea.pagaCon, linea.vuelto)]
            : []
        })

  const [primerPago, ...otrosPagos] = pagos
  // Confirmar el cobro exige al menos un pago, por eso este caso no puede darse
  if (!primerPago) throw new Error('Un comprobante cobrado necesita al menos un pago')

  return {
    ...datosComunes,
    estado: 'completada',
    clienteReferencia: null,
    pagos: [primerPago, ...otrosPagos],
  }
}
