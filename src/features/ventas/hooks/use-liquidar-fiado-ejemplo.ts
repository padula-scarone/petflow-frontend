import { useState } from 'react'
import { useCobroVentaEjemplo } from '@/features/ventas/hooks/use-cobro-venta-ejemplo'
import type { EstadoCobro } from '@/features/ventas/types/cobro'
import type {
  CobroFiadoProps,
  ErrorAccionVenta,
  FilaHistorial,
  LiquidarFiadoServidor,
  PagoCobroFiado,
  ReciboFiado,
} from '@/features/ventas/types/historial'
import {
  construirEnlaceMail,
  construirEnlaceWhatsApp,
} from '@/features/ventas/utils/construir-enlaces-comprobante'
import { convertirVentaAComprobante } from '@/features/ventas/utils/convertir-venta-a-comprobante'

// Hook temporal para probar el cobro de un fiado: se reemplaza por el hook real de Liquidar Fiado.

/** Opciones del hook de cobro de un fiado. */
interface OpcionesLiquidarFiado {
  fila: FilaHistorial
  /** Simula POST /api/ventas/:idVenta/cobro. */
  liquidarFiado: LiquidarFiadoServidor
}

/** Arma el body del cobro. Los montos son la parte del importe que cubre cada medio, sin su ajuste. */
function construirPagosCobro(estadoCobro: EstadoCobro, importeAdeudado: number): PagoCobroFiado[] {
  const admiteVuelto = (idMedioPago: number) =>
    estadoCobro.mediosDisponibles.find((medio) => medio.idMedioPago === idMedioPago)?.admiteVuelto ?? false

  if (estadoCobro.formaPago === 'mixto') {
    return estadoCobro.lineasPagoMixto.map((linea) => ({
      idMedioPago: linea.idMedioPago,
      monto: linea.montoACubrir ?? 0,
      montoRecibido:
        admiteVuelto(linea.idMedioPago) && linea.pagaCon !== null ? linea.pagaCon : undefined,
    }))
  }
  const idMedioPago = estadoCobro.idMedioSeleccionado
  if (idMedioPago === null) return []
  return [
    {
      idMedioPago,
      monto: importeAdeudado,
      montoRecibido:
        admiteVuelto(idMedioPago) && estadoCobro.pagaCon !== null ? estadoCobro.pagaCon : undefined,
    },
  ]
}

export function useLiquidarFiadoEjemplo({ fila, liquidarFiado }: OpcionesLiquidarFiado) {
  // --- ESTADOS ---
  // El importe se fija al abrir: despues del cobro el montoTotal de la fila cambia con los ajustes
  const [importeAdeudado] = useState(fila.montoTotal)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<ErrorAccionVenta | null>(null)
  const [recibo, setRecibo] = useState<ReciboFiado | null>(null)

  // Reutiliza el cobro de Registrar Venta: sin descuento manual y sin la opcion de fiado
  const propiedadesCobro = useCobroVentaEjemplo(importeAdeudado)

  // --- ACCIONES ---
  const confirmarCobro = async () => {
    setEnviando(true)
    setError(null)
    const respuesta = await liquidarFiado(
      fila.idVenta,
      construirPagosCobro(propiedadesCobro.estadoCobro, importeAdeudado),
    )
    setEnviando(false)

    if (respuesta.tipo === 'error') {
      setError(respuesta.error)
      return
    }
    const comprobante = convertirVentaAComprobante(respuesta.venta)
    const vueltoTotal = respuesta.venta.pagos.reduce((acumulado, pago) => acumulado + (pago.vuelto ?? 0), 0)
    setRecibo({
      comprobante,
      enlaceWhatsApp: construirEnlaceWhatsApp(comprobante),
      enlaceMail: construirEnlaceMail(comprobante),
      vuelto: vueltoTotal > 0 ? vueltoTotal : null,
      montoTotalCobrado: respuesta.venta.montoTotal,
    })
  }

  const propiedades: Pick<
    CobroFiadoProps,
    'fila' | 'importeAdeudado' | 'propiedadesCobro' | 'enviando' | 'error' | 'recibo' | 'onConfirmarCobro'
  > = {
    fila,
    importeAdeudado,
    propiedadesCobro,
    enviando,
    error,
    recibo,
    onConfirmarCobro: confirmarCobro,
  }
  return propiedades
}
