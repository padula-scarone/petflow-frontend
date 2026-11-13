import {
  ID_CAMBIO_RECHAZADO_POR_PLAZO,
  ID_CAMBIO_SIN_STOCK_PARA_REVERTIR,
  ID_PRODUCTO_RECHAZADO,
  ID_PRODUCTO_SIN_STOCK,
  ID_VENTA_NO_ENCONTRADA,
  ID_VENTA_SIN_CAJA,
  NOMBRE_USUARIO_CAMBIOS_EJEMPLO,
} from '@/features/ventas/cambios-mercaderia/config/simulacion-cambios'
import type {
  BorradorCambio,
  CambioMercaderiaDetalle,
  ErrorAccionCambio,
  RegistrarCambioBody,
  ResumenSaldoCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import { obtenerProductoCambioEjemplo } from '@/features/ventas/cambios-mercaderia/utils/catalogo-cambios-ejemplo'
import { calcularLimiteModificacionCambio } from '@/features/ventas/cambios-mercaderia/utils/calcular-ventana-cambio'
import type { MedioPago } from '@/features/ventas/types/cobro'
import { CODIGO_MOTIVO_OTRO } from '@/features/ventas/config/motivos-venta'

// Temporal: simula las reglas que en la integracion aplica el back.

const ERROR_CAMBIO_NO_ENCONTRADO: ErrorAccionCambio = {
  estadoHttp: 404,
  codigo: 'CAMBIO_NO_ENCONTRADO',
  mensaje: 'El cambio ya no existe. Actualizá el listado para ver los datos vigentes.',
}

/** Respuesta del servidor a editar o anular un cambio: null si la acepta, o el motivo del rechazo. */
export function simularModificacionCambio(
  cambio: CambioMercaderiaDetalle | undefined,
  ahoraServidorMilisegundos: number,
): ErrorAccionCambio | null {
  if (!cambio) return ERROR_CAMBIO_NO_ENCONTRADO
  if (cambio.estado === 'ANULADO') {
    return { estadoHttp: 409, codigo: 'CAMBIO_YA_ANULADO', mensaje: 'El cambio ya estaba anulado.' }
  }
  const vencidoSegunServidor =
    cambio.fechaHoraLimiteModificacion !== null &&
    ahoraServidorMilisegundos > Date.parse(cambio.fechaHoraLimiteModificacion)
  if (cambio.idCambio === ID_CAMBIO_RECHAZADO_POR_PLAZO || vencidoSegunServidor) {
    return {
      estadoHttp: 403,
      codigo: 'PLAZO_VENCIDO',
      mensaje: 'El plazo de 15 minutos ya venció: el cambio no se puede editar ni anular.',
    }
  }
  // El granel que entro con la bolsa abierta ya se vendio: no hay de donde descontarlo
  if (cambio.idCambio === ID_CAMBIO_SIN_STOCK_PARA_REVERTIR) {
    return {
      estadoHttp: 409,
      codigo: 'STOCK_INSUFICIENTE_PARA_REVERTIR',
      mensaje:
        'No se puede revertir: el stock a granel que ingresó con este cambio ya se vendió y no alcanza para descontarlo.',
    }
  }
  return null
}

/** Respuesta del servidor al alta de un cambio: null si la acepta, o el motivo del rechazo. */
export function simularRegistroCambio(body: RegistrarCambioBody): ErrorAccionCambio | null {
  if (body.idVentaOriginal === ID_VENTA_NO_ENCONTRADA) {
    return {
      estadoHttp: 404,
      codigo: 'VENTA_NO_ENCONTRADA',
      mensaje: 'No encontramos la venta que quisiste vincular. Elegí otra o cargá el cambio sin vincular.',
    }
  }
  if (body.idVentaOriginal === ID_VENTA_SIN_CAJA) {
    return {
      estadoHttp: 409,
      codigo: 'SIN_CAJA_ABIERTA',
      mensaje: 'No hay una caja abierta para registrar el cambio. Abrí la caja e intentá de nuevo.',
    }
  }
  if (body.idProductoEntregado === ID_PRODUCTO_SIN_STOCK) {
    // La pantalla no deja elegir un producto sin stock: este rechazo es la carrera, cuando otro vendedor
    // se llevo las unidades mientras este cambio se cargaba
    const { nombreProducto } = obtenerProductoCambioEjemplo(body.idProductoEntregado)
    return {
      estadoHttp: 409,
      codigo: 'STOCK_INSUFICIENTE',
      mensaje: `Mientras cargabas el cambio se vendió el stock de «${nombreProducto}» y ya no alcanza. Volvé al paso de artículos y elegí otro producto.`,
    }
  }
  if (body.idProductoEntregado === ID_PRODUCTO_RECHAZADO) {
    return {
      estadoHttp: 400,
      codigo: 'DATOS_INVALIDOS',
      mensaje: 'El servidor rechazó los datos del cambio. Revisalos e intentá de nuevo.',
    }
  }
  return null
}

/** Arma el body del POST a partir de lo cargado. Solo viaja lo que el servidor no puede calcular. */
export function construirBodyRegistrarCambio(
  borrador: BorradorCambio,
  admiteVuelto: boolean,
  saldo: number,
): RegistrarCambioBody | null {
  const { articuloDevuelto, articuloEntregado, codigoMotivo } = borrador
  if (!articuloDevuelto || !articuloEntregado || !codigoMotivo) return null
  const cantidadDevuelta = articuloDevuelto.esBolsaAbierta ? articuloDevuelto.pesoDevueltoKg : articuloDevuelto.cantidad
  if (cantidadDevuelta === null || articuloEntregado.cantidad === null) return null

  return {
    idVentaOriginal: borrador.ventaVinculada?.idVenta ?? null,
    idProductoDevuelto: articuloDevuelto.idProducto,
    // Con bolsa abierta se reutiliza el campo cantidad para el peso real devuelto
    cantidadDevuelta,
    esBolsaAbierta: articuloDevuelto.esBolsaAbierta,
    idProductoEntregado: articuloEntregado.idProducto,
    cantidadEntregada: articuloEntregado.cantidad,
    idMedioPago: saldo > 0 ? borrador.idMedioPago : null,
    montoRecibido: saldo > 0 && admiteVuelto ? borrador.montoRecibido : null,
    codigoMotivo,
    detalleMotivo: codigoMotivo === CODIGO_MOTIVO_OTRO ? borrador.detalleMotivo.trim() : null,
  }
}

/** Cambio tal como lo dejaria registrado el servidor: precios congelados, saldo, pago y limite de la ventana. */
export function construirCambioRegistrado(
  borrador: BorradorCambio,
  resumen: ResumenSaldoCambio,
  medio: MedioPago | undefined,
  idCambio: number,
  ahoraServidorMilisegundos: number,
): CambioMercaderiaDetalle | null {
  const { articuloDevuelto, articuloEntregado, codigoMotivo } = borrador
  if (!articuloDevuelto || !articuloEntregado || !codigoMotivo) return null
  if (articuloDevuelto.cantidad === null || articuloEntregado.cantidad === null) return null

  const bolsa = articuloDevuelto.esBolsaAbierta ? articuloDevuelto.opcionBolsaAbierta : null
  const cambio: CambioMercaderiaDetalle = {
    idCambio,
    fechaHora: new Date(ahoraServidorMilisegundos).toISOString(),
    estado: 'ACTIVO',
    ventaVinculada: borrador.ventaVinculada
      ? {
          idVenta: borrador.ventaVinculada.idVenta,
          numeroComprobante: borrador.ventaVinculada.numeroComprobante,
        }
      : null,
    saldoResultante: resumen.saldo,
    articuloDevuelto: {
      idProducto: articuloDevuelto.idProducto,
      nombreProducto: articuloDevuelto.nombreProducto,
      formatoVenta: articuloDevuelto.formatoVenta,
      // Bolsa abierta: se registra el peso real y el precio por kg
      cantidad: bolsa ? (articuloDevuelto.pesoDevueltoKg ?? 0) : articuloDevuelto.cantidad,
      precioUnitario: bolsa ? bolsa.precioPorKg : articuloDevuelto.precioUnitario,
      subtotal: resumen.valorDevuelto,
      esBolsaAbierta: articuloDevuelto.esBolsaAbierta,
      idProductoStockIngresado: bolsa ? bolsa.idProductoGranel : articuloDevuelto.idProducto,
      nombreProductoStockIngresado: bolsa ? bolsa.nombreProductoGranel : articuloDevuelto.nombreProducto,
    },
    articuloEntregado: {
      idProducto: articuloEntregado.idProducto,
      nombreProducto: articuloEntregado.nombreProducto,
      formatoVenta: articuloEntregado.formatoVenta,
      cantidad: articuloEntregado.cantidad,
      precioUnitario: articuloEntregado.precioUnitario,
      subtotal: resumen.valorEntregado,
    },
    valorDevuelto: resumen.valorDevuelto,
    valorEntregado: resumen.valorEntregado,
    pagoSaldo:
      medio && resumen.saldo > 0
        ? {
            idMedioPago: medio.idMedioPago,
            nombreMedioPago: medio.nombre,
            montoRecibido: medio.admiteVuelto ? borrador.montoRecibido : null,
            vuelto: medio.admiteVuelto ? resumen.vuelto : null,
          }
        : null,
    motivo: {
      codigoMotivo,
      detalleMotivo: codigoMotivo === CODIGO_MOTIVO_OTRO ? borrador.detalleMotivo.trim() : null,
    },
    // En la integracion el vendedor sale del token
    vendedor: { idUsuario: 0, nombre: NOMBRE_USUARIO_CAMBIOS_EJEMPLO },
    anulacion: null,
    fechaHoraLimiteModificacion: null,
  }
  return { ...cambio, fechaHoraLimiteModificacion: calcularLimiteModificacionCambio(cambio) }
}
