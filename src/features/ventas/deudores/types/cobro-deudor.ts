import type { OrigenFicha } from '@/features/ventas/deudores/config/rutas-deudores'
import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import type { EstadoFichaDeudor, FiadoPendiente } from '@/features/ventas/deudores/types/cuenta-corriente'
import type { PagoComprobante } from '@/features/ventas/types/comprobante'

/** Un fiado en la tabla de cobro, con lo que el vendedor tildo y tipeo. */
export interface FilaFiadoSeleccionable {
  fiado: FiadoPendiente
  seleccionado: boolean
  /** Pesos a cobrar de este fiado; null = campo vacio. Por defecto, lo que falta. */
  montoACobrar: number | null
  /** "Ingresá un monto mayor a cero" o "No puede superar lo que falta"; null si el monto es valido. */
  errorMonto: string | null
  /** Verdadero para el fiado que llego desde "Ver deuda" del Historial. */
  resaltado: boolean
}

/** Lo que resume la seleccion de fiados. */
export interface ResumenSeleccionFiados {
  cantidadSeleccionados: number
  totalACobrar: number
  todosSeleccionados: boolean
  hayErrores: boolean
  /** Hay al menos uno tildado, todos con monto valido. */
  puedeCobrar: boolean
}

/**
 * Por que el back rechazo el cobro. Es todo o nada: si falla uno, no se cobra ninguno. Los tres primeros dicen que
 * la cuenta cambio (hay que volver a pedirla); los dos siguientes, que se puede reintentar tal cual.
 */
export type MotivoRechazoCobro =
  | 'FIADO_NO_ENCONTRADO'
  | 'FIADO_NO_PENDIENTE'
  | 'MONTO_EXCEDE_FALTA'
  | 'SIN_CAJA_ABIERTA'
  | 'COBRO_SIMULTANEO'
  | 'DEUDOR_NO_ENCONTRADO'
  | 'DATOS_INVALIDOS'
  | 'MEDIO_PAGO_NO_DISPONIBLE'
  | 'SIN_PERMISO'
  /** Sin respuesta util y la ficha no alcanzo para saber si se cobro: no se reenvia a ciegas. */
  | 'RESULTADO_INCIERTO'
  | 'DESCONOCIDO'

/** Rechazo del cobro: el back respondio y no se guardo nada. */
export interface ErrorCobroDeudor {
  /** null cuando no hubo respuesta del back (resultado incierto). */
  estadoHttp: 400 | 401 | 403 | 404 | 409 | null
  motivo: MotivoRechazoCobro
  /** Texto propio, sin datos del deudor ni detalle tecnico. */
  mensaje: string
  /** Verdadero si el mismo cobro puede reenviarse tal cual (hay que abrir la caja, o reintentar en unos segundos). */
  reintentable: boolean
  /** Verdadero si hay que volver a pedir la ficha porque un fiado cambio. */
  refrescarFicha: boolean
}

/** Lo que registro un cobro, ya en tipos del front. */
export interface CobroDeudorRegistrado {
  idCobro: number
  numeroRecibo: string
  /** ISO 8601. */
  fechaHora: string
  fiadosAbonados: FiadoAbonado[]
  pagos: PagoComprobante[]
  /** Lo que baja la deuda: suma de las porciones base. */
  montoAbonado: number
  /** Lo que paga el cliente, con los ajustes de los medios. */
  montoTotalCobrado: number
  /** Suma de los vueltos de los pagos en efectivo; null si no hubo. */
  vuelto: number | null
  /** El saldo TOTAL del deudor despues del cobro. */
  saldoRestanteDeudor: number
}

/** Un cobro ya guardado, tal como lo devuelve el recibo del back: sin saldo posterior ni lo que falto de cada fiado. */
export interface CobroConsultado {
  idCobro: number
  numeroRecibo: string | null
  /** ISO 8601. */
  fechaHora: string
  /** Quien lo registro: el usuario de la sesion de ese momento. */
  nombreVendedor: string
  fiados: { idVenta: number; numeroComprobante: string; montoAbonado: number }[]
  pagos: PagoComprobante[]
  montoTotalCobrado: number
  vuelto: number | null
}

/** Como termino el pedido de cobro. */
export type ResultadoCobroDeudor =
  | { tipo: 'cobrado'; cobro: CobroDeudorRegistrado }
  | { tipo: 'rechazado'; error: ErrorCobroDeudor }
  /** Sin respuesta util (sin red, tiempo agotado, 5xx o respuesta ilegible): el cobro pudo guardarse. */
  | { tipo: 'incierto' }

/** Un fiado dentro del recibo consolidado. */
export interface FiadoAbonado {
  idVenta: number
  numeroComprobante: string
  montoAbonado: number
  montoFaltanteResultante: number
  estadoResultante: 'PENDIENTE_PAGO' | 'COMPLETADA'
}

/** Recibo consolidado de un cobro; tiene numeracion propia, distinta de la de los comprobantes de venta. */
export interface ReciboCobroDeudor {
  idCobro: number
  numeroRecibo: string
  /** Fecha y hora del cobro en formato ISO 8601. */
  fechaHora: string
  deudor: Deudor
  nombreVendedor: string
  fiadosAbonados: FiadoAbonado[]
  pagos: PagoComprobante[]
  /** Lo que se abona a los fiados: suma de las porciones base. */
  montoAbonado: number
  /** Lo efectivamente cobrado, con los ajustes de los medios. */
  montoTotalCobrado: number
  vuelto: number | null
  saldoRestanteDeudor: number
  enlaceWhatsApp: string
  enlaceMail: string
}

/** Props de la ficha de un deudor: su cuenta y la seleccion de fiados a cobrar. */
export interface FichaDeudorProps {
  estadoFicha: EstadoFichaDeudor
  /** Un fiado por fila, con lo tildado y lo tipeado; vacio hasta que la ficha esta lista. */
  filasFiados: FilaFiadoSeleccionable[]
  resumenSeleccion: ResumenSeleccionFiados
  /** Pantalla desde la que se llego: dice a donde vuelve "Volver" (el texto del boton). */
  origen: OrigenFicha
  onVolver: () => void
  onReintentar: () => void
  onEditarDeudor: () => void
  onAlternarFiado: (idVenta: number) => void
  onCambiarMontoFiado: (idVenta: number, monto: number | null) => void
  /** Tilda todos los fiados; si ya estaban todos tildados, los destilda. */
  onSeleccionarTodos: () => void
  onCobrarFiados: () => void
}
