import type { LineaPagoMixto, MedioPago } from '@/features/ventas/types/cobro'
import type {
  DatosDeudor,
  Deudor,
  EstadoBusquedaDeudor,
  EstadoGuardadoDeudor,
} from '@/features/ventas/deudores/types/deudor'
// EstadoGuardadoDeudor es lo que devuelve onCrearDeudor

/** Con que paga AHORA. El fiado ya no es una forma de pago: es lo que queda sin pagar. */
export type FormaPagoAhora = 'unico' | 'mixto'

/** Fecha estimada de pago de la deuda. En el estado, null significa que todavia no decidio: es obligatorio decidir. */
export type FechaEstimadaPago =
  | { modo: 'fecha'; fecha: string }
  | { modo: 'sin-fecha' }

/** Totales del paso de pago. Todo lo deriva el hook; la vista solo lo muestra. */
export interface ResumenPagoConDeuda {
  subtotalProductos: number
  montoDescuentoManual: number
  /** Importe de la venta: subtotal menos descuento manual, sin ajustes de medios. */
  importeVenta: number
  /** Suma de las porciones base que se pagan ahora. */
  pagadoAhoraBase: number
  /** Recargos y descuentos de los medios, solo sobre lo que se paga ahora. */
  ajusteMediosPago: number
  /** Lo que realmente se cobra ahora: porciones base mas ajustes. */
  cobradoAhora: number
  /** Importe de la venta menos lo pagado ahora (base). En cero la venta es de contado. */
  queDebe: number
  /** Cuanto superan los pagos al importe; 0 si no hay exceso. */
  excedente: number
}

/** Bloque "Deuda": solo existe cuando queDebe es mayor a cero. */
export interface EstadoDeuda {
  deudorElegido: Deudor | null
  /** null hasta que el vendedor elige una fecha o "Sin fecha". */
  fechaEstimada: FechaEstimadaPago | null
  textoBusqueda: string
  estadoBusqueda: EstadoBusquedaDeudor
  /** Verdadero si el alta devolvio 409 y se selecciono a quien ya tenia ese DNI. */
  avisoDniExistente: boolean
}

/** Estado del paso de pago con deuda. */
export interface EstadoPagoConDeuda {
  formaPago: FormaPagoAhora
  /** Intencion explicita de no pagar nada ahora. */
  fiarTodo: boolean
  mediosDisponibles: MedioPago[]
  /** Pago unico. */
  idMedioSeleccionado: number | null
  /** Porcion base que cubre el medio ahora; null = campo vacio. */
  montoAhora: number | null
  pagaCon: number | null
  /** Solo si el medio admite vuelto y "Paga con" supera lo que se cobra ahora. */
  vuelto: number | null
  /** Pago mixto. */
  lineasPagoMixto: LineaPagoMixto[]
  resumen: ResumenPagoConDeuda
  /** null cuando no hay deuda, o cuando todavia no se eligio como paga (un medio o "Fiar todo"). */
  deuda: EstadoDeuda | null
  puedeConfirmar: boolean
  /**
   * Error que impide confirmar, ej. "El monto con el que paga no cubre lo que se cobra ahora". Lo que falta elegir
   * (medio, deudor, fecha) no tiene texto: bloquea el boton y nada mas.
   */
  motivoNoConfirmable?: string
  /** Por que el monto del pago unico no es valido, ej. "Ingresa un monto mayor a cero". */
  errorMontoAhora?: string
}

/**
 * Confirmacion de una venta con deuda. Son dos llamadas que no son atomicas (el fiado y, si se pago algo, el cobro del
 * pago inicial): las tres ultimas fases son decisiones del vendedor DESPUES de que la venta ya existe. En ellas nunca se
 * reenvia el alta de la venta.
 */
export type EstadoConfirmacionConDeuda =
  | { fase: 'cerrada' }
  | { fase: 'resumen' }
  /** `paso` dice que esta viajando: la venta, el pago inicial o la carga del comprobante. */
  | { fase: 'enviando'; paso: 'venta' | 'pago' | 'comprobante' }
  /** El back rechazo la venta sin guardar nada (404: el deudor ya no existe; 400: dato invalido), o no se encontro. */
  | { fase: 'error'; estadoHttp: 400 | 401 | 403 | 404 | 409 | null; mensaje: string; reintentable: boolean }
  /** Sin respuesta util y no se pudo verificar: la venta pudo guardarse. No se reenvia. */
  | { fase: 'venta-incierta'; mensaje: string }
  /** La venta existe como deuda total pero el pago inicial no se registro (o no se pudo confirmar). */
  | { fase: 'pago-no-registrado'; mensaje: string; reintentable: boolean; incierto: boolean }
  /** La venta existe pero no se pudo cargar su comprobante. */
  | { fase: 'comprobante-pendiente'; mensaje: string }

/** Props del paso de pago con deuda. Los callbacks son las unicas puertas de entrada del vendedor. */
export interface PropiedadesPagoConDeuda {
  estadoPago: EstadoPagoConDeuda
  estadoConfirmacion: EstadoConfirmacionConDeuda
  // --- Forma y medios de pago ---
  onCambiarFormaPago: (formaPago: FormaPagoAhora) => void
  onSeleccionarMedioPago: (idMedioPago: number) => void
  onCambiarMontoAhora: (monto: number | null) => void
  onCambiarPagaCon: (monto: number | null) => void
  onFiarTodo: () => void
  onCobrarAlgoAhora: () => void
  // --- Pago mixto ---
  onAgregarLineaPago: (idMedioPago: number) => void
  onQuitarLineaPago: (idMedioPago: number) => void
  onCambiarMontoLinea: (idMedioPago: number, monto: number | null) => void
  onCambiarPagaConLinea: (idMedioPago: number, monto: number | null) => void
  onCompletarConRestante: (idMedioPago: number) => void
  onAjustarMontosAutomaticamente: () => void
  // --- Deuda ---
  onBuscarDeudor: (texto: string) => void
  onReintentarBusquedaDeudor: () => void
  onSeleccionarDeudor: (deudor: Deudor) => void
  onCambiarDeudor: () => void
  onCrearDeudor: (datos: DatosDeudor) => Promise<EstadoGuardadoDeudor>
  onCambiarFechaEstimada: (fecha: FechaEstimadaPago | null) => void
  // --- Confirmacion ---
  /** Con deuda abre el resumen para confirmar; sin deuda es una venta de contado y la confirma directamente. */
  onConfirmarPago: () => void
  onCerrarResumen: () => void
  /** Registra la venta con deuda; tambien reintenta el pago inicial o la carga del comprobante si la venta ya existe. */
  onConfirmarVentaConDeuda: () => void
  /** Con el pago inicial sin registrar: sigue con la venta como deuda total, y el comprobante lo avisa. */
  onContinuarSinPagoInicial: () => void
  /** Con la venta incierta: descarta la venta en curso (no se puede reenviar sin riesgo de duplicarla). */
  onAbandonarVentaIncierta: () => void
}
