import { esObjeto } from '@/lib/es-objeto'
import type { ResultadoApi } from '@/lib/cliente-http.types'
import { convertirTextoACentavos, convertirTextoAMilesimas } from '@/features/ventas/api/conversores-numericos'
import { crearFalloRespuestaInvalida } from '@/features/ventas/api/crear-fallo-respuesta-invalida'
import { esCambioDetalleApi } from '@/features/ventas/cambios-mercaderia/api/validar-respuesta-cambios'
import type {
  CambioDetalleApi,
  CambioListadoApi,
} from '@/features/ventas/cambios-mercaderia/types/api-cambios'
import type {
  CambioMercaderiaDetalle,
  CambioMercaderiaListado,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
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
export function convertirCambioListadoApi(cambio: CambioListadoApi): CambioMercaderiaListado | null {
  const cantidadDevuelta = convertirTextoACantidad(cambio.cantidadDevuelta)
  const cantidadEntregada = convertirTextoACantidad(cambio.cantidadEntregada)
  const saldoResultante = convertirTextoAPesos(cambio.saldoResultante)
  const pesoDevueltoKg =
    cambio.esBolsaAbierta && cambio.cantidadStockIngresado !== null
      ? convertirTextoACantidad(cambio.cantidadStockIngresado)
      : null
  if (cantidadDevuelta === null || cantidadEntregada === null || saldoResultante === null) return null
  // Una bolsa abierta sin kilos ingresados no cumple el contrato
  if (cambio.esBolsaAbierta && pesoDevueltoKg === null) return null

  return {
    idCambio: cambio.idCambio,
    fechaHora: cambio.fechaHora,
    estado: cambio.estado,
    ventaVinculada:
      cambio.idVentaOriginal === null
        ? null
        : {
            idVenta: cambio.idVentaOriginal,
            numeroComprobante: cambio.numeroComprobanteVentaOriginal ?? NUMERO_COMPROBANTE_AUSENTE,
          },
    productoDevuelto: {
      idProducto: cambio.idProductoDevuelto,
      nombreProducto: cambio.nombreProductoDevuelto,
      formatoVenta: cambio.formatoVentaProductoDevuelto,
      cantidad: cantidadDevuelta,
      esBolsaAbierta: cambio.esBolsaAbierta,
      pesoDevueltoKg,
    },
    productoEntregado: {
      idProducto: cambio.idProductoEntregado,
      nombreProducto: cambio.nombreProductoEntregado,
      formatoVenta: cambio.formatoVentaProductoEntregado,
      cantidad: cantidadEntregada,
    },
    saldoResultante,
    idMedioPago: cambio.idMedioPago,
    nombreMedioPago: cambio.nombreMedioPago,
    fechaHoraLimiteModificacion: cambio.fechaHoraLimiteModificacion,
  }
}

// --- DETALLE ---

/**
 * Traduce el detalle de un cambio (el mismo contenido que devuelven el alta y la anulacion). Con bolsa abierta
 * el precio del devuelto es el de la bolsa, el subtotal es el credito de la fraccion y los kilos salen de lo que
 * ingreso al granel. Devuelve null si algun numero no se lee.
 */
export function convertirCambioDetalleApi(cambio: CambioDetalleApi): CambioMercaderiaDetalle | null {
  const { articuloDevuelto, articuloEntregado, productoStockIngresado, pagoSaldo, anulacion } = cambio
  const cantidadDevuelta = convertirTextoACantidad(articuloDevuelto.cantidadDevuelta)
  const precioDevuelto = convertirTextoAPesos(articuloDevuelto.precioUnitario)
  const subtotalDevuelto = convertirTextoAPesos(articuloDevuelto.subtotal)
  const cantidadEntregada = convertirTextoACantidad(articuloEntregado.cantidadEntregada)
  const precioEntregado = convertirTextoAPesos(articuloEntregado.precioUnitario)
  const subtotalEntregado = convertirTextoAPesos(articuloEntregado.subtotal)
  const valorDevuelto = convertirTextoAPesos(cambio.valorDevuelto)
  const valorEntregado = convertirTextoAPesos(cambio.valorEntregado)
  const saldoResultante = convertirTextoAPesos(cambio.saldoResultante)
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
    idCambio: cambio.idCambio,
    fechaHora: cambio.fechaHora,
    estado: cambio.estado,
    ventaVinculada:
      cambio.ventaVinculada === null
        ? null
        : {
            idVenta: cambio.ventaVinculada.idVenta,
            numeroComprobante: cambio.ventaVinculada.numeroComprobante ?? NUMERO_COMPROBANTE_AUSENTE,
          },
    saldoResultante,
    fechaHoraLimiteModificacion: cambio.fechaHoraLimiteModificacion,
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
    motivoCambio: cambio.motivoCambio,
    vendedor: cambio.vendedor,
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

// --- RESPUESTAS QUE TRAEN UN CAMBIO ---

/** Un cambio ya traducido, con el desfase entre el reloj del servidor y el del dispositivo. */
export interface CambioConsultado {
  cambio: CambioMercaderiaDetalle
  /** Hora del servidor menos hora local, en milisegundos, medida al recibir la respuesta. */
  desfaseServidorMilisegundos: number
}

/**
 * Valida y traduce una respuesta con la forma `{ fechaHoraServidor, cambio }` (detalle, alta o anulacion). Un
 * 2xx con una forma que no cumple el contrato es un fallo: quien llama decide si es un resultado incierto.
 * @param estadoHttp Estado de la respuesta, para informarlo en el fallo.
 */
export function leerRespuestaConCambio(datos: unknown, estadoHttp: number): ResultadoApi<CambioConsultado> {
  if (
    !esObjeto(datos) ||
    typeof datos.fechaHoraServidor !== 'string' ||
    Number.isNaN(Date.parse(datos.fechaHoraServidor)) ||
    !esCambioDetalleApi(datos.cambio)
  ) {
    return crearFalloRespuestaInvalida(estadoHttp)
  }
  const cambio = convertirCambioDetalleApi(datos.cambio)
  if (cambio === null) return crearFalloRespuestaInvalida(estadoHttp)
  return {
    exitoso: true,
    datos: { cambio, desfaseServidorMilisegundos: Date.parse(datos.fechaHoraServidor) - Date.now() },
  }
}
