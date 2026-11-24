import { MARGEN_VERIFICACION_MILISEGUNDOS } from '@/features/ventas/config/reglas-venta'
import type { CuentaDeudor } from '@/features/ventas/deudores/types/cuenta-corriente'
import type { VentaHistorialConsultada } from '@/features/ventas/types/historial'
import { convertirPesosACentavos } from '@/features/ventas/utils/calcular-centavos'

// Cuando el resultado de un cobro es incierto (sin red, tiempo agotado, 5xx, respuesta ilegible) se mira la ficha del
// deudor para saber que paso de verdad. El cobro no tiene clave de idempotencia: reenviarlo a ciegas puede cobrar dos
// veces. Solo se reintenta cuando la ficha muestra que NO se aplico.

/** Un fiado que se envio a cobrar, para reconocer el propio cobro en la ficha. */
export interface FiadoEnviadoACobrar {
  idVenta: number
  /** Lo que se abono a este fiado, en pesos. */
  monto: number
}

export type VerificacionCobroDeudor =
  /** Cada fiado tiene un pago nuevo con el monto enviado y todos son del mismo cobro: el cobro se aplico. */
  | { tipo: 'aplicado'; idCobroDeudor: number }
  /** Ningun fiado tiene un pago nuevo: es seguro reintentar. */
  | { tipo: 'no-aplicado' }
  /** No alcanza para decidir (un fiado desaparecio de la ficha, o solo algunos tienen el pago): no se reenvia. */
  | { tipo: 'indeterminado' }

/**
 * Decide que paso con un cobro a partir de la ficha del deudor.
 * @param enviadoEnMilisegundos Hora (del dispositivo) en que salio el pedido; el pago nuevo es posterior a ella,
 * con un margen por la diferencia entre el reloj del dispositivo y el del servidor.
 */
export function verificarCobroEnFicha(
  cuenta: CuentaDeudor,
  fiadosEnviados: FiadoEnviadoACobrar[],
  enviadoEnMilisegundos: number,
): VerificacionCobroDeudor {
  const idsDeCobrosNuevos: number[] = []
  let fiadosSinPagoNuevo = 0

  for (const enviado of fiadosEnviados) {
    const fiado = cuenta.fiados.find((candidato) => candidato.idVenta === enviado.idVenta)
    // Un fiado que ya no figura puede haberse completado con este cobro o con otro: no se puede asegurar
    if (fiado === undefined) return { tipo: 'indeterminado' }

    const pagoNuevo = fiado.pagos.find(
      (pago) =>
        Date.parse(pago.fechaHora) >= enviadoEnMilisegundos - MARGEN_VERIFICACION_MILISEGUNDOS &&
        convertirPesosACentavos(pago.monto) === convertirPesosACentavos(enviado.monto),
    )
    if (pagoNuevo === undefined) fiadosSinPagoNuevo += 1
    else idsDeCobrosNuevos.push(pagoNuevo.idCobroDeudor)
  }

  if (fiadosSinPagoNuevo === fiadosEnviados.length) return { tipo: 'no-aplicado' }
  const [primerCobro] = idsDeCobrosNuevos
  const sonTodosDelMismoCobro = idsDeCobrosNuevos.every((idCobro) => idCobro === primerCobro)
  return fiadosSinPagoNuevo === 0 && primerCobro !== undefined && sonTodosDelMismoCobro
    ? { tipo: 'aplicado', idCobroDeudor: primerCobro }
    : { tipo: 'indeterminado' }
}

// --- ALTA DEL FIADO ---

/** Lo que se envio al registrar el fiado, para reconocerlo en el Historial. */
export interface EnvioFiado {
  idDeudor: number
  /** Importe de la venta (subtotal menos descuento manual), en centavos. */
  importeVentaCentavos: number
  /** Hora (del dispositivo) en que salio el pedido, en milisegundos. */
  enviadoEnMilisegundos: number
}

/**
 * Busca en las ventas pendientes de hoy el fiado que se acaba de enviar: del mismo deudor, por el mismo importe y
 * creado despues del envio (con margen por la diferencia de relojes). Las filas del Historial traen el id del deudor,
 * asi no hace falta pedir el nombre en la consulta.
 */
export function buscarFiadoRegistrado(ventas: VentaHistorialConsultada[], envio: EnvioFiado) {
  return ventas.find(
    (venta) =>
      venta.estado === 'PENDIENTE_PAGO' &&
      venta.deudor?.idDeudor === envio.idDeudor &&
      convertirPesosACentavos(venta.montoTotal) === envio.importeVentaCentavos &&
      Date.parse(venta.fechaHora) >= envio.enviadoEnMilisegundos - MARGEN_VERIFICACION_MILISEGUNDOS,
  )
}
