import type {
  CobroConsultado,
  CobroDeudorRegistrado,
  ReciboCobroDeudor,
} from '@/features/ventas/deudores/types/cobro-deudor'
import type { CuentaDeudor } from '@/features/ventas/deudores/types/cuenta-corriente'
import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import {
  construirEnlaceMailConTexto,
  construirEnlaceWhatsAppConTexto,
  construirTextoReciboCobro,
} from '@/features/ventas/deudores/utils/construir-enlaces-deudores'
import { convertirCentavosAPesos, convertirPesosACentavos } from '@/features/ventas/utils/calcular-centavos'

/** Texto que lleva el recibo cuando el back todavia no le asigno numero. */
const NUMERO_RECIBO_PENDIENTE = 'Sin número'

/** Arma el recibo consolidado de un cobro, con los enlaces para enviarlo por WhatsApp o mail. */
export function armarReciboCobroDeudor(
  cobro: CobroDeudorRegistrado,
  deudor: Deudor,
  nombreVendedor: string,
): ReciboCobroDeudor {
  const datosRecibo = {
    idCobro: cobro.idCobro,
    numeroRecibo: cobro.numeroRecibo,
    fechaHora: cobro.fechaHora,
    deudor,
    nombreVendedor,
    fiadosAbonados: cobro.fiadosAbonados,
    pagos: cobro.pagos,
    montoAbonado: cobro.montoAbonado,
    montoTotalCobrado: cobro.montoTotalCobrado,
    vuelto: cobro.vuelto,
    saldoRestanteDeudor: cobro.saldoRestanteDeudor,
  }
  const texto = construirTextoReciboCobro(datosRecibo)
  return {
    ...datosRecibo,
    enlaceWhatsApp: construirEnlaceWhatsAppConTexto(texto),
    enlaceMail: construirEnlaceMailConTexto(`PetFlow - Recibo ${datosRecibo.numeroRecibo}`, texto),
  }
}

/**
 * Completa un cobro ya guardado (que el back devuelve sin saldo ni faltas) con lo que dice la ficha de ahora: lo que
 * falta de cada fiado y el saldo del deudor. Si algun fiado ya no esta en la ficha, quedo completado.
 */
export function completarCobroConsultado(consultado: CobroConsultado, cuenta: CuentaDeudor): CobroDeudorRegistrado {
  const montoAbonadoCentavos = consultado.fiados.reduce(
    (suma, fiado) => suma + convertirPesosACentavos(fiado.montoAbonado),
    0,
  )
  return {
    idCobro: consultado.idCobro,
    numeroRecibo: consultado.numeroRecibo ?? NUMERO_RECIBO_PENDIENTE,
    fechaHora: consultado.fechaHora,
    fiadosAbonados: consultado.fiados.map((fiado) => {
      const fiadoDeLaCuenta = cuenta.fiados.find((candidato) => candidato.idVenta === fiado.idVenta)
      return {
        idVenta: fiado.idVenta,
        numeroComprobante: fiado.numeroComprobante,
        montoAbonado: fiado.montoAbonado,
        montoFaltanteResultante: fiadoDeLaCuenta?.montoFaltante ?? 0,
        estadoResultante: fiadoDeLaCuenta === undefined ? 'COMPLETADA' : 'PENDIENTE_PAGO',
      }
    }),
    pagos: consultado.pagos,
    montoAbonado: convertirCentavosAPesos(montoAbonadoCentavos),
    montoTotalCobrado: consultado.montoTotalCobrado,
    vuelto: consultado.vuelto,
    saldoRestanteDeudor: cuenta.saldo,
  }
}
