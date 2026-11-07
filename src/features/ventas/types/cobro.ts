import type { LucideIcon } from 'lucide-react'

/** Forma de cobro. 'fiado' es excluyente: no se combina con otros medios. */
export type FormaPago = 'unico' | 'mixto' | 'fiado'

/** Ajuste automatico que aplica un medio de pago sobre su monto. */
export type TipoAjuste = 'descuento' | 'recargo' | 'ninguno'

/** Como se expresa un descuento manual. */
export type TipoDescuentoManual = 'porcentaje' | 'monto'

/** Medio de pago configurado en la seccion "Medios de pago". */
export interface MedioPago {
  idMedioPago: string
  nombre: string
  /** Si falta, la vista usa un icono generico. */
  icono?: LucideIcon
  tipoAjuste: TipoAjuste
  /** Porcentaje del ajuste; 0 cuando tipoAjuste es 'ninguno'. */
  porcentajeAjuste: number
  /** Solo efectivo: habilita "Paga con" y "Vuelto". */
  admiteVuelto: boolean
}

/** Linea de un pago mixto; los montos derivados los calcula el hook. */
export interface LineaPagoMixto {
  idMedioPago: string
  /** Parte del total que cubre este medio, antes de aplicar su ajuste. */
  montoACubrir: number | null
  /** Solo si el medio admite vuelto. */
  pagaCon: number | null
  vuelto: number | null
  /** Negativo = descuento, positivo = recargo. */
  montoAjuste: number
}

/** Datos que emite el formulario de descuento al aplicarse. */
export interface DatosDescuentoManual {
  motivo: string
  tipo: TipoDescuentoManual
  valor: number
}

/** Descuento manual unico de la venta. */
export interface DescuentoManual extends DatosDescuentoManual {
  /** Monto efectivamente descontado, calculado por el hook. */
  montoDescontado: number
}

/** Cliente deudor, obligatorio para registrar un fiado. */
export interface ClienteFiado {
  idCliente: string
  nombreCompleto: string
  telefono?: string
}

/** Datos que emite el formulario de cliente nuevo. */
export interface DatosNuevoCliente {
  nombreCompleto: string
  telefono?: string
}

/** Totales que la vista solo muestra. */
export interface ResumenCobro {
  subtotalProductos: number
  montoDescuentoManual: number
  /** Suma de ajustes de los medios elegidos (negativo = descuento). */
  montoAjusteMediosPago: number
  total: number
  /** Solo pago mixto; 0 cuando esta cubierto o excedido. */
  faltaCubrir: number
  /** Solo pago mixto; cuanto superan los montos al total. 0 si no hay exceso. */
  excedente: number
}

/** Estado del cobro en curso. */
export interface EstadoCobro {
  formaPago: FormaPago
  mediosDisponibles: MedioPago[]
  /** Pago unico. */
  idMedioSeleccionado: string | null
  pagaCon: number | null
  vuelto: number | null
  /** Pago mixto. */
  lineasPagoMixto: LineaPagoMixto[]
  /** Fiado. */
  clienteFiado: ClienteFiado | null
  descuentoManual: DescuentoManual | null
  resumen: ResumenCobro
  puedeConfirmar: boolean
  /** Por que no se puede confirmar, ej. "Falta cubrir $ 2.000". */
  motivoNoConfirmable?: string
}

/** Props del componente presentacional de la Seccion 2 de Registrar Venta. */
export interface RegistrarVentaCobroProps {
  estadoCobro: EstadoCobro
  // --- Navegacion y cierre ---
  onVolverAlCarrito: () => void
  onCancelarVenta: () => void
  onConfirmarCobro: () => void
  // --- Forma y medios de pago ---
  onCambiarFormaPago: (formaPago: FormaPago) => void
  onSeleccionarMedioPago: (idMedioPago: string) => void
  onCambiarPagaCon: (monto: number | null) => void
  // --- Pago mixto ---
  onAgregarLineaPago: (idMedioPago: string) => void
  onQuitarLineaPago: (idMedioPago: string) => void
  onCambiarMontoLinea: (idMedioPago: string, monto: number | null) => void
  onCambiarPagaConLinea: (idMedioPago: string, monto: number | null) => void
  onCompletarConRestante: (idMedioPago: string) => void
  /** Reduce los montos de los ultimos medios hasta que sumen el total exacto. */
  onAjustarMontosAutomaticamente: () => void
  // --- Descuento manual ---
  formularioDescuentoAbierto: boolean
  errorFormularioDescuento?: string
  onAbrirFormularioDescuento: () => void
  onCerrarFormularioDescuento: () => void
  onAplicarDescuento: (datos: DatosDescuentoManual) => void
  onQuitarDescuento: () => void
  // --- Fiado ---
  textoBusquedaCliente: string
  resultadosBusquedaCliente: ClienteFiado[]
  onBuscarCliente: (textoBusqueda: string) => void
  onSeleccionarCliente: (idCliente: string) => void
  onQuitarCliente: () => void
  onCrearCliente: (datos: DatosNuevoCliente) => void
}
