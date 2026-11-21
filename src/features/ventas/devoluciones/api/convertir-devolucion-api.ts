import { esObjeto } from '@/lib/es-objeto'
import type { ResultadoApi } from '@/lib/cliente-http.types'
import { convertirTextoACentavos, convertirTextoAMilesimas } from '@/features/ventas/api/conversores-numericos'
import { crearFalloRespuestaInvalida } from '@/features/ventas/api/crear-fallo-respuesta-invalida'
import { esDevolucionDetalleApi } from '@/features/ventas/devoluciones/api/validar-respuesta-devoluciones'
import type {
  DevolucionDetalleApi,
  DevolucionListadoApi,
} from '@/features/ventas/devoluciones/types/api-devoluciones'
import type {
  DevolucionDetalle,
  DevolucionListado,
} from '@/features/ventas/devoluciones/types/devolucion'
import { NUMERO_COMPROBANTE_AUSENTE } from '@/features/ventas/config/reglas-venta'
import { convertirCentavosAPesos } from '@/features/ventas/utils/calcular-centavos'

const FACTOR_MILESIMAS = 1000

/** "58000.00" -> 58000 (pesos con centavos, sin pasar por coma flotante); null si no es un monto valido. */
function convertirTextoAPesos(texto: string) {
  const centavos = convertirTextoACentavos(texto)
  return centavos === null ? null : convertirCentavosAPesos(centavos)
}

/** "2.500" -> 2.5; null si no es una cantidad valida. */
function convertirTextoACantidad(texto: string) {
  const milesimas = convertirTextoAMilesimas(texto)
  return milesimas === null ? null : milesimas / FACTOR_MILESIMAS
}

const convertirPesosOpcionales = (texto: string | null) =>
  texto === null ? null : convertirTextoAPesos(texto)

// --- LISTA ---

/**
 * Traduce una fila de la lista: montos en pesos con centavos y cantidades numericas. Con bolsa abierta,
 * `cantidad` del devuelto son bolsas enteras y los kilos van aparte. Devuelve null si algun numero no se lee.
 */
export function convertirDevolucionListadoApi(devolucion: DevolucionListadoApi): DevolucionListado | null {
  const cantidadDevuelta = convertirTextoACantidad(devolucion.cantidadDevuelta)
  const cantidadEntregada = convertirTextoACantidad(devolucion.cantidadEntregada)
  const saldoResultante = convertirTextoAPesos(devolucion.saldoResultante)
  const pesoDevueltoKg =
    devolucion.esBolsaAbierta && devolucion.cantidadStockIngresado !== null
      ? convertirTextoACantidad(devolucion.cantidadStockIngresado)
      : null
  if (cantidadDevuelta === null || cantidadEntregada === null || saldoResultante === null) return null
  // Una bolsa abierta sin kilos ingresados no cumple el contrato
  if (devolucion.esBolsaAbierta && pesoDevueltoKg === null) return null

  return {
    idDevolucion: devolucion.idCambio,
    fechaHora: devolucion.fechaHora,
    estado: devolucion.estado,
    ventaVinculada:
      devolucion.idVentaOriginal === null
        ? null
        : {
            idVenta: devolucion.idVentaOriginal,
            numeroComprobante: devolucion.numeroComprobanteVentaOriginal ?? NUMERO_COMPROBANTE_AUSENTE,
          },
    productoDevuelto: {
      idProducto: devolucion.idProductoDevuelto,
      nombreProducto: devolucion.nombreProductoDevuelto,
      formatoVenta: devolucion.formatoVentaProductoDevuelto,
      cantidad: cantidadDevuelta,
      esBolsaAbierta: devolucion.esBolsaAbierta,
      pesoDevueltoKg,
    },
    productoEntregado: {
      idProducto: devolucion.idProductoEntregado,
      nombreProducto: devolucion.nombreProductoEntregado,
      formatoVenta: devolucion.formatoVentaProductoEntregado,
      cantidad: cantidadEntregada,
    },
    saldoResultante,
    idMedioPago: devolucion.idMedioPago,
    nombreMedioPago: devolucion.nombreMedioPago,
    fechaHoraLimiteModificacion: devolucion.fechaHoraLimiteModificacion,
  }
}

// --- DETALLE ---

/**
 * Traduce el detalle de una devolución (el mismo contenido que devuelven el alta y la anulacion). Con bolsa abierta
 * el precio del devuelto es el de la bolsa, el subtotal es el credito de la fraccion y los kilos salen de lo que
 * ingreso al granel. Devuelve null si algun numero no se lee.
 */
export function convertirDevolucionDetalleApi(devolucion: DevolucionDetalleApi): DevolucionDetalle | null {
  const { articuloDevuelto, articuloEntregado, productoStockIngresado, pagoSaldo, anulacion } = devolucion
  const cantidadDevuelta = convertirTextoACantidad(articuloDevuelto.cantidadDevuelta)
  const precioDevuelto = convertirTextoAPesos(articuloDevuelto.precioUnitario)
  const subtotalDevuelto = convertirTextoAPesos(articuloDevuelto.subtotal)
  const cantidadEntregada = convertirTextoACantidad(articuloEntregado.cantidadEntregada)
  const precioEntregado = convertirTextoAPesos(articuloEntregado.precioUnitario)
  const subtotalEntregado = convertirTextoAPesos(articuloEntregado.subtotal)
  const valorDevuelto = convertirTextoAPesos(devolucion.valorDevuelto)
  const valorEntregado = convertirTextoAPesos(devolucion.valorEntregado)
  const saldoResultante = convertirTextoAPesos(devolucion.saldoResultante)
  const pesoDevueltoKg =
    articuloDevuelto.esBolsaAbierta && productoStockIngresado.cantidadStockIngresado !== null
      ? convertirTextoACantidad(productoStockIngresado.cantidadStockIngresado)
      : null
  const montoRecibido = pagoSaldo === null ? null : convertirPesosOpcionales(pagoSaldo.montoRecibido)
  const vuelto = pagoSaldo === null ? null : convertirPesosOpcionales(pagoSaldo.vuelto)

  if (
    cantidadDevuelta === null ||
    precioDevuelto === null ||
    subtotalDevuelto === null ||
    cantidadEntregada === null ||
    precioEntregado === null ||
    subtotalEntregado === null ||
    valorDevuelto === null ||
    valorEntregado === null ||
    saldoResultante === null
  ) {
    return null
  }
  if (articuloDevuelto.esBolsaAbierta && pesoDevueltoKg === null) return null
  // Un recibido o un vuelto que llegaron con texto pero no son numeros invalidan el pago
  if (pagoSaldo !== null) {
    if (pagoSaldo.montoRecibido !== null && montoRecibido === null) return null
    if (pagoSaldo.vuelto !== null && vuelto === null) return null
  }

  return {
    idDevolucion: devolucion.idCambio,
    fechaHora: devolucion.fechaHora,
    estado: devolucion.estado,
    ventaVinculada:
      devolucion.ventaVinculada === null
        ? null
        : {
            idVenta: devolucion.ventaVinculada.idVenta,
            numeroComprobante: devolucion.ventaVinculada.numeroComprobante ?? NUMERO_COMPROBANTE_AUSENTE,
          },
    saldoResultante,
    fechaHoraLimiteModificacion: devolucion.fechaHoraLimiteModificacion,
    articuloDevuelto: {
      idProducto: articuloDevuelto.idProducto,
      nombreProducto: articuloDevuelto.nombreProducto,
      formatoVenta: articuloDevuelto.formatoVenta,
      cantidad: cantidadDevuelta,
      precioUnitario: precioDevuelto,
      subtotal: subtotalDevuelto,
      esBolsaAbierta: articuloDevuelto.esBolsaAbierta,
      pesoDevueltoKg,
      idProductoStockIngresado: productoStockIngresado.idProducto,
      nombreProductoStockIngresado: productoStockIngresado.nombreProducto,
    },
    articuloEntregado: {
      idProducto: articuloEntregado.idProducto,
      nombreProducto: articuloEntregado.nombreProducto,
      formatoVenta: articuloEntregado.formatoVenta,
      cantidad: cantidadEntregada,
      precioUnitario: precioEntregado,
      subtotal: subtotalEntregado,
    },
    valorDevuelto,
    valorEntregado,
    pagoSaldo:
      pagoSaldo === null
        ? null
        : {
            idMedioPago: pagoSaldo.idMedioPago,
            nombreMedioPago: pagoSaldo.nombreMedioPago,
            montoRecibido,
            vuelto,
          },
    motivoDevolucion: devolucion.motivoCambio,
    vendedor: devolucion.vendedor,
    anulacion:
      anulacion === null
        ? null
        : {
            motivo: anulacion.motivo,
            idUsuario: anulacion.usuario.idUsuario,
            nombreUsuario: anulacion.usuario.nombre,
            fechaHora: anulacion.fechaHora,
          },
  }
}

// --- RESPUESTAS QUE TRAEN UNA DEVOLUCIÓN ---

/** Una devolución ya traducida, con el desfase entre el reloj del servidor y el del dispositivo. */
export interface DevolucionConsultada {
  devolucion: DevolucionDetalle
  /** Hora del servidor menos hora local, en milisegundos, medida al recibir la respuesta. */
  desfaseServidorMilisegundos: number
}

/**
 * Valida y traduce una respuesta con la forma `{ fechaHoraServidor, cambio }` (detalle, alta o anulacion). Un
 * 2xx con una forma que no cumple el contrato es un fallo: quien llama decide si es un resultado incierto.
 * @param estadoHttp Estado de la respuesta, para informarlo en el fallo.
 */
export function leerRespuestaConDevolucion(datos: unknown, estadoHttp: number): ResultadoApi<DevolucionConsultada> {
  if (
    !esObjeto(datos) ||
    typeof datos.fechaHoraServidor !== 'string' ||
    Number.isNaN(Date.parse(datos.fechaHoraServidor)) ||
    !esDevolucionDetalleApi(datos.cambio)
  ) {
    return crearFalloRespuestaInvalida(estadoHttp)
  }
  const devolucion = convertirDevolucionDetalleApi(datos.cambio)
  if (devolucion === null) return crearFalloRespuestaInvalida(estadoHttp)
  return {
    exitoso: true,
    datos: { devolucion, desfaseServidorMilisegundos: Date.parse(datos.fechaHoraServidor) - Date.now() },
  }
}
