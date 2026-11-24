import { MOTIVO_MONTO_AHORA_VACIO } from '@/features/ventas/deudores/config/mensajes-deudores'
import type { FormaPagoAhora, ResumenPagoConDeuda } from '@/features/ventas/deudores/types/pago-con-deuda'
import { MOTIVO_INGRESAR_PAGA_CON } from '@/features/ventas/config/mensajes-error-venta'
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
  confirmable: boolean
  /**
   * Error que se le muestra al vendedor; undefined si no hay ninguno. Lo que todavia falta elegir (medio, deudor,
   * fecha) bloquea la confirmacion sin texto: el boton deshabilitado y el bloque a completar ya lo dicen.
   */
  motivoNoConfirmable: string | undefined
  /** Error del campo "Cobrar ahora" del pago unico. */
  errorMontoAhora: string | undefined
}

const CONFIRMABLE: EvaluacionPagoConDeuda = {
  confirmable: true,
  motivoNoConfirmable: undefined,
  errorMontoAhora: undefined,
}
const FALTA_ELEGIR: EvaluacionPagoConDeuda = {
  confirmable: false,
  motivoNoConfirmable: undefined,
  errorMontoAhora: undefined,
}

/** Un error que se muestra debajo del boton de confirmar. */
function bloquearCon(motivo: string, errorMontoAhora?: string): EvaluacionPagoConDeuda {
  return { confirmable: false, motivoNoConfirmable: motivo, errorMontoAhora }
}

/** Decide si el pago se puede confirmar, y si no, por que. El primer motivo que aparece es el que vale. */
export function evaluarPagoConDeuda(entrada: EntradaEvaluacionPago): EvaluacionPagoConDeuda {
  const { resumen, fiarTodo } = entrada

  if (!fiarTodo) {
    if (entrada.estadoMediosPago.fase === 'cargando') return FALTA_ELEGIR
    if (entrada.estadoMediosPago.fase === 'error') return FALTA_ELEGIR
  }
  if (resumen.importeVenta <= 0) {
    return bloquearCon('El descuento deja el total en cero: no hay nada para cobrar')
  }

  if (!fiarTodo && entrada.formaPago === 'unico') {
    if (!entrada.hayMedioUnicoElegido) return FALTA_ELEGIR
    if (entrada.montoAhoraUnico === null || entrada.montoAhoraUnico <= 0) {
      return bloquearCon(MOTIVO_MONTO_AHORA_VACIO, MOTIVO_MONTO_AHORA_VACIO)
    }
    if (resumen.excedente > 0) {
      const mensaje = `El monto no puede superar el total (${formatearMoneda(resumen.importeVenta)})`
      return bloquearCon(mensaje, mensaje)
    }
    if (entrada.medioUnicoAdmiteVuelto) {
      if (entrada.pagaConCentavos === null) return bloquearCon(MOTIVO_INGRESAR_PAGA_CON)
      if (entrada.pagaConCentavos < entrada.cobradoAhoraCentavos) {
        return bloquearCon('El monto con el que paga no cubre lo que se cobra ahora')
      }
      if (entrada.pagaConCentavos > MONTO_RECIBIDO_MAXIMO_CENTAVOS) {
        return bloquearCon('El monto con el que paga es demasiado alto')
      }
    }
  }

  if (!fiarTodo && entrada.formaPago === 'mixto') {
    if (entrada.cantidadLineasMixto === 0) return FALTA_ELEGIR
    if (entrada.motivoCobroMixto !== undefined) return bloquearCon(entrada.motivoCobroMixto)
    // La diferencia ya la muestra el estado del pago: aca solo se bloquea la confirmacion
    if (resumen.excedente > 0) return bloquearCon(`Los montos superan el total en ${formatearMoneda(resumen.excedente)}`)
  }

  if (entrada.hayDeuda && (!entrada.hayDeudorElegido || !entrada.hayFechaEstimadaElegida)) return FALTA_ELEGIR
  return CONFIRMABLE
}
