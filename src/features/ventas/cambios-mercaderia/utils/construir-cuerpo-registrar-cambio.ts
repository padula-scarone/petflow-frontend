import { ETIQUETA_POR_MOTIVO_CAMBIO } from '@/features/ventas/cambios-mercaderia/config/motivos-cambio'
import type { RegistrarCambioRequest } from '@/features/ventas/cambios-mercaderia/types/api-cambios'
import type { BorradorCambio, ResumenSaldoCambio } from '@/features/ventas/cambios-mercaderia/types/cambio'
import type { MedioPago } from '@/features/ventas/types/cobro'
import { construirTextoMotivoConEtiquetas } from '@/features/ventas/utils/construir-texto-motivo'

/** Redondea a 3 decimales (la precision de las cantidades y los pesos) para no mandar 0,30000000000000004. */
const redondearAMilesimas = (valor: number) => Math.round(valor * 1000) / 1000

/**
 * Arma el body del alta a partir de lo cargado. Los opcionales se OMITEN (el back responde 400 a un null):
 * - la venta, solo si hay una vinculada;
 * - con bolsa abierta la cantidad devuelta es 1 (bolsas enteras) y el peso va aparte; sin bolsa abierta no va el peso;
 * - el medio, solo si hay saldo a cobrar; el monto recibido, ademas, solo con un medio que admite vuelto (efectivo).
 * El motivo viaja como texto: la etiqueta elegida o, con "Otro", el detalle escrito.
 * Devuelve null si falta algun dato obligatorio (la validacion no deberia dejar llegar hasta aca).
 */
export function construirCuerpoRegistrarCambio(
  borrador: BorradorCambio,
  resumenSaldo: ResumenSaldoCambio,
  medioSeleccionado: MedioPago | undefined,
): RegistrarCambioRequest | null {
  const { articuloDevuelto, articuloEntregado, codigoMotivo } = borrador
  if (articuloDevuelto === null || articuloEntregado === null || codigoMotivo === null) return null
  if (articuloEntregado.cantidad === null) return null
  if (articuloDevuelto.esBolsaAbierta && articuloDevuelto.pesoDevueltoKg === null) return null
  if (!articuloDevuelto.esBolsaAbierta && articuloDevuelto.cantidad === null) return null

  const cobraSaldo = resumenSaldo.situacion === 'A_COBRAR'
  if (cobraSaldo && borrador.idMedioPago === null) return null

  const cantidadDevuelta = articuloDevuelto.esBolsaAbierta ? 1 : (articuloDevuelto.cantidad as number)
  return {
    ...(borrador.ventaVinculada !== null && { idVentaOriginal: borrador.ventaVinculada.idVenta }),
    idProductoDevuelto: articuloDevuelto.idProducto,
    cantidadDevuelta: redondearAMilesimas(cantidadDevuelta),
    esBolsaAbierta: articuloDevuelto.esBolsaAbierta,
    ...(articuloDevuelto.esBolsaAbierta && {
      pesoDevuelto: redondearAMilesimas(articuloDevuelto.pesoDevueltoKg as number),
    }),
    idProductoEntregado: articuloEntregado.idProducto,
    cantidadEntregada: redondearAMilesimas(articuloEntregado.cantidad),
    ...(cobraSaldo && borrador.idMedioPago !== null && { idMedioPago: borrador.idMedioPago }),
    ...(cobraSaldo &&
      medioSeleccionado?.admiteVuelto === true &&
      borrador.montoRecibido !== null && { montoRecibido: borrador.montoRecibido }),
    motivoCambio: construirTextoMotivoConEtiquetas(codigoMotivo, borrador.detalleMotivo, ETIQUETA_POR_MOTIVO_CAMBIO),
  }
}
