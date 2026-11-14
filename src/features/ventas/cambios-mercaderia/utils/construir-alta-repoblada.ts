import {
  AVISO_MOTIVO_NO_REGISTRADO,
  AVISO_VENTA_NO_DISPONIBLE,
  AVISO_VENTA_YA_NO_VINCULABLE,
  crearAvisoArticuloNoDisponible,
} from '@/features/ventas/cambios-mercaderia/config/mensajes-error-cambio'
import type {
  AltaRepoblada,
  ArticuloDevueltoCargado,
  ArticuloEntregadoCargado,
  CambioMercaderiaDetalle,
  ProductoCatalogoCambio,
  VentaVinculada,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import {
  crearArticuloDevueltoDesdeCatalogo,
  crearArticuloDevueltoDesdeItem,
  crearArticuloEntregado,
} from '@/features/ventas/cambios-mercaderia/utils/crear-articulos-cambio'
import { inferirMotivoCambio } from '@/features/ventas/cambios-mercaderia/utils/inferir-motivo-cambio'
import type { MedioPago } from '@/features/ventas/types/cobro'

/** Que paso al traer la venta vinculada del cambio antes de anularlo. */
export type VentaParaRepoblar =
  /** El cambio no tenia venta. */
  | { tipo: 'sin-venta' }
  | { tipo: 'vinculada'; venta: VentaVinculada }
  /** La venta ya no esta COMPLETADA: no se puede vincular. */
  | { tipo: 'no-vinculable' }
  /** No se pudo leer la venta. */
  | { tipo: 'no-disponible' }

/** Todo lo que se junta ANTES de anular para poder repoblar el alta sin depender de otro pedido. */
export interface DatosParaRepoblar {
  /** El cambio tal como esta (ACTIVO), antes de anularlo. */
  cambio: CambioMercaderiaDetalle
  venta: VentaParaRepoblar
  /** Catalogo fresco: solo activos, con su stock de antes de anular. */
  catalogo: ProductoCatalogoCambio[]
  medios: MedioPago[]
}

const redondearACantidad = (cantidad: number) => Math.round(cantidad * 1000) / 1000

/**
 * Venta vinculada con lo devuelto al dia: el cambio que se edita ya no va a contar en `cantidadYaDevuelta`
 * cuando se anule, asi que lo que devolvio queda disponible otra vez.
 */
function liberarLoDevueltoPorElCambio(venta: VentaVinculada, cambio: CambioMercaderiaDetalle): VentaVinculada {
  const { idProducto, cantidad } = cambio.articuloDevuelto
  return {
    ...venta,
    items: venta.items.map((item) =>
      item.idProducto === idProducto
        ? { ...item, cantidadYaDevuelta: Math.max(0, redondearACantidad(item.cantidadYaDevuelta - cantidad)) }
        : item,
    ),
  }
}

/** Articulo devuelto con las cantidades del cambio original; sin bolsa abierta disponible, vuelve como bolsa cerrada. */
function repoblarArticuloDevuelto(
  base: ArticuloDevueltoCargado,
  cambio: CambioMercaderiaDetalle,
  avisos: string[],
): ArticuloDevueltoCargado {
  const { esBolsaAbierta, pesoDevueltoKg, cantidad } = cambio.articuloDevuelto
  const conBolsaAbierta = esBolsaAbierta && base.opcionBolsaAbierta !== null
  if (esBolsaAbierta && !conBolsaAbierta) {
    avisos.push(
      `${base.nombreProducto} ya no admite devolverse como bolsa abierta: revisá el peso y la cantidad antes de confirmar.`,
    )
  }
  return {
    ...base,
    esBolsaAbierta: conBolsaAbierta,
    // Con bolsa abierta la bolsa es una sola y el peso real viaja aparte
    cantidad: conBolsaAbierta ? 1 : cantidad,
    pesoDevueltoKg: conBolsaAbierta ? pesoDevueltoKg : null,
  }
}

/**
 * Arma el alta que se reabre al editar un cambio, con el cambio todavia sin anular. Los precios son los vigentes
 * (los del renglon de la venta, o los del catalogo sin venta). Lo que no se puede repoblar (venta que ya no es
 * COMPLETADA, producto inactivo o sin stock, medio de pago dado de baja) se avisa y se deja vacio, sin bloquear
 * el resto. El stock del articulo entregado se ajusta como lo hara la anulacion: se repone lo entregado.
 */
export function construirAltaRepoblada({ cambio, venta, catalogo, medios }: DatosParaRepoblar): AltaRepoblada {
  const avisos: string[] = []
  const { articuloDevuelto, articuloEntregado, pagoSaldo } = cambio

  // --- VENTA VINCULADA ---
  const ventaVinculada = venta.tipo === 'vinculada' ? liberarLoDevueltoPorElCambio(venta.venta, cambio) : null
  if (venta.tipo === 'no-vinculable') avisos.push(AVISO_VENTA_YA_NO_VINCULABLE)
  if (venta.tipo === 'no-disponible') avisos.push(AVISO_VENTA_NO_DISPONIBLE)

  // --- ARTICULO DEVUELTO ---
  // Con venta sale de sus renglones (aunque el producto ya no este activo); sin venta, del catalogo
  const itemDeLaVenta = ventaVinculada?.items.find((item) => item.idProducto === articuloDevuelto.idProducto)
  const productoDeCatalogo = catalogo.find((producto) => producto.idProducto === articuloDevuelto.idProducto)
  const baseDevuelto: ArticuloDevueltoCargado | null = itemDeLaVenta
    ? crearArticuloDevueltoDesdeItem(itemDeLaVenta)
    : productoDeCatalogo
      ? crearArticuloDevueltoDesdeCatalogo(productoDeCatalogo)
      : null
  if (baseDevuelto === null) avisos.push(crearAvisoArticuloNoDisponible('devuelto', articuloDevuelto.nombreProducto))

  // --- ARTICULO ENTREGADO ---
  // Al anular se repone lo entregado y se descuenta lo que ingreso: el stock efectivo cambia en esa medida
  const productoEntregado = catalogo.find((producto) => producto.idProducto === articuloEntregado.idProducto)
  const cantidadIngresada = articuloDevuelto.esBolsaAbierta
    ? (articuloDevuelto.pesoDevueltoKg ?? 0)
    : articuloDevuelto.cantidad
  const stockTrasAnular = productoEntregado
    ? productoEntregado.stockDisponible +
      articuloEntregado.cantidad -
      (articuloDevuelto.idProductoStockIngresado === productoEntregado.idProducto ? cantidadIngresada : 0)
    : 0
  const entregadoCargado: ArticuloEntregadoCargado | null =
    productoEntregado && stockTrasAnular > 0
      ? {
          ...crearArticuloEntregado({ ...productoEntregado, stockDisponible: redondearACantidad(stockTrasAnular) }),
          cantidad: articuloEntregado.cantidad,
        }
      : null
  if (entregadoCargado === null) avisos.push(crearAvisoArticuloNoDisponible('entregado', articuloEntregado.nombreProducto))

  // --- COBRO ---
  const medio = pagoSaldo === null ? undefined : medios.find((candidato) => candidato.idMedioPago === pagoSaldo.idMedioPago)
  if (pagoSaldo !== null && medio === undefined) {
    avisos.push(`El medio de pago ${pagoSaldo.nombreMedioPago} ya no está disponible. Elegí otro.`)
  }

  // --- MOTIVO ---
  const motivo = inferirMotivoCambio(cambio.motivoCambio)
  if (motivo.codigoMotivo === null) avisos.push(AVISO_MOTIVO_NO_REGISTRADO)

  return {
    borrador: {
      ventaVinculada,
      articuloDevuelto: baseDevuelto && repoblarArticuloDevuelto(baseDevuelto, cambio, avisos),
      articuloEntregado: entregadoCargado,
      idMedioPago: medio?.idMedioPago ?? null,
      // "Paga con" solo existe en efectivo
      montoRecibido: medio?.admiteVuelto ? (pagoSaldo?.montoRecibido ?? null) : null,
      codigoMotivo: motivo.codigoMotivo,
      detalleMotivo: motivo.detalleMotivo,
    },
    avisos,
  }
}
