import {
  MOTIVO_ELEGIR_DEUDOR,
  MOTIVO_ELEGIR_FECHA_ESTIMADA,
  MOTIVO_ELEGIR_MEDIO_O_FIAR_TODO,
  MOTIVO_MONTO_AHORA_VACIO,
} from '@/features/ventas/deudores/config/mensajes-deudores'
import type { FormaPagoAhora, ResumenPagoConDeuda } from '@/features/ventas/deudores/types/pago-con-deuda'
import { MOTIVO_ELEGIR_MEDIO_PAGO } from '@/features/ventas/config/mensajes-error-venta'
import { MONTO_RECIBIDO_MAXIMO_CENTAVOS } from '@/features/ventas/config/reglas-venta'
import type { EstadoCargaRecurso } from '@/features/ventas/types/carga'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Todo lo que decide si el pago se puede confirmar. */
interface EntradaEvaluacionPago {
  formaPago: FormaPagoAhora
  fiarTodo: boolean
  estadoMediosPago: EstadoCargaRecurso
  resumen: ResumenPagoConDeuda
  // --- Pago unico ---
  hayMedioUnicoElegido: boolean
  medioUnicoAdmiteVuelto: boolean
  /** Lo que figura en el campo "Cobrar ahora"; null = vacio. */
  montoAhoraUnico: number | null
  /** Lo que escribio en "Paga con"; null = vacio. */
  pagaConCentavos: number | null
  cobradoAhoraCentavos: number
  // --- Pago mixto ---
  cantidadLineasMixto: number
  /** Motivo que ya calcula el cobro de siempre para el pago mixto (medios sin monto, efectivo que no alcanza). */
  motivoCobroMixto: string | undefined
  // --- Deuda ---
  hayDeuda: boolean
  hayDeudorElegido: boolean
  hayFechaEstimadaElegida: boolean
}

/** Resultado de la evaluacion. */
export interface EvaluacionPagoConDeuda {
  /** Primer motivo que impide confirmar; undefined si se puede. */
  motivoNoConfirmable: string | undefined
  /** Error del campo "Cobrar ahora" del pago unico. */
  errorMontoAhora: string | undefined
}

/** Decide si el pago se puede confirmar, y si no, por que. El primer motivo que aparece es el que se muestra. */
export function evaluarPagoConDeuda(entrada: EntradaEvaluacionPago): EvaluacionPagoConDeuda {
  const { resumen, fiarTodo } = entrada
  const sinErrores = (motivoNoConfirmable?: string): EvaluacionPagoConDeuda => ({
    motivoNoConfirmable,
    errorMontoAhora: undefined,
  })

  if (!fiarTodo) {
    if (entrada.estadoMediosPago.fase === 'cargando') return sinErrores('Cargando los medios de pago')
    if (entrada.estadoMediosPago.fase === 'error') return sinErrores('No se pudieron cargar los medios de pago')
  }
  if (resumen.importeVenta <= 0) {
    return sinErrores('El descuento deja el total en cero: no hay nada para cobrar')
  }

  if (!fiarTodo && entrada.formaPago === 'unico') {
    if (!entrada.hayMedioUnicoElegido) return sinErrores(MOTIVO_ELEGIR_MEDIO_PAGO)
    if (entrada.montoAhoraUnico === null || entrada.montoAhoraUnico <= 0) {
      return { motivoNoConfirmable: MOTIVO_MONTO_AHORA_VACIO, errorMontoAhora: MOTIVO_MONTO_AHORA_VACIO }
    }
    if (resumen.excedente > 0) {
      const mensaje = `El monto no puede superar el total (${formatearMoneda(resumen.importeVenta)})`
      return { motivoNoConfirmable: mensaje, errorMontoAhora: mensaje }
    }
    if (entrada.medioUnicoAdmiteVuelto && entrada.pagaConCentavos !== null) {
      if (entrada.pagaConCentavos < entrada.cobradoAhoraCentavos) {
        return sinErrores('El monto con el que paga no cubre lo que se cobra ahora')
      }
      if (entrada.pagaConCentavos > MONTO_RECIBIDO_MAXIMO_CENTAVOS) {
        return sinErrores('El monto con el que paga es demasiado alto')
      }
    }
  }

  if (!fiarTodo && entrada.formaPago === 'mixto') {
    if (entrada.cantidadLineasMixto === 0) return sinErrores(MOTIVO_ELEGIR_MEDIO_O_FIAR_TODO)
    if (entrada.motivoCobroMixto !== undefined) return sinErrores(entrada.motivoCobroMixto)
    // La diferencia ya la muestra el estado del pago: aca solo se bloquea la confirmacion
    if (resumen.excedente > 0) return sinErrores(`Los montos superan el total en ${formatearMoneda(resumen.excedente)}`)
  }

  if (entrada.hayDeuda) {
    if (!entrada.hayDeudorElegido) return sinErrores(MOTIVO_ELEGIR_DEUDOR)
    if (!entrada.hayFechaEstimadaElegida) return sinErrores(MOTIVO_ELEGIR_FECHA_ESTIMADA)
  }
  return sinErrores()
}
