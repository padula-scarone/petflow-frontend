import type {
  EstadoVentaApi,
  FormatoVentaApi,
  ModalidadEntregaApi,
  OrigenApi,
  TipoMedioPagoApi,
} from '@/features/ventas/types/api-ventas'
import type { EstadoVentaRegistrada } from '@/features/ventas/types/registro-venta'
import type {
  CanalVenta,
  FormatoArticulo,
  TipoEntrega,
} from '@/features/ventas/types/venta'

// El back usa MAYUSCULAS y el front minusculas. Los Record son exhaustivos: si el back suma un valor,
// el compilador obliga a decidir su traduccion.

const CANAL_POR_ORIGEN: Record<OrigenApi, CanalVenta> = { MOSTRADOR: 'mostrador', DIGITAL: 'digital' }
const ORIGEN_POR_CANAL: Record<CanalVenta, OrigenApi> = { mostrador: 'MOSTRADOR', digital: 'DIGITAL' }

const ENTREGA_POR_MODALIDAD: Record<ModalidadEntregaApi, TipoEntrega> = {
  RETIRO: 'retiro',
  ENVIO: 'envio',
}
const MODALIDAD_POR_ENTREGA: Record<TipoEntrega, ModalidadEntregaApi> = {
  retiro: 'RETIRO',
  envio: 'ENVIO',
}

const FORMATO_POR_FORMATO_API: Record<FormatoVentaApi, FormatoArticulo> = {
  UNIDAD: 'unidad',
  GRANEL: 'granel',
}

const ESTADO_POR_ESTADO_API: Record<EstadoVentaApi, EstadoVentaRegistrada> = {
  COMPLETADA: 'completada',
  PENDIENTE_PAGO: 'pendiente-pago',
}

// --- GUARDAS: VALIDAN LO QUE LLEGA DEL BACK ANTES DE TRADUCIRLO ---
function esClaveDe<Clave extends string>(
  tabla: Record<Clave, unknown>,
  valor: unknown,
): valor is Clave {
  return typeof valor === 'string' && Object.hasOwn(tabla, valor)
}

export const esOrigenApi = (valor: unknown): valor is OrigenApi => esClaveDe(CANAL_POR_ORIGEN, valor)
export const esModalidadEntregaApi = (valor: unknown): valor is ModalidadEntregaApi =>
  esClaveDe(ENTREGA_POR_MODALIDAD, valor)
export const esFormatoVentaApi = (valor: unknown): valor is FormatoVentaApi =>
  esClaveDe(FORMATO_POR_FORMATO_API, valor)
export const esEstadoVentaApi = (valor: unknown): valor is EstadoVentaApi =>
  esClaveDe(ESTADO_POR_ESTADO_API, valor)

const TIPOS_MEDIO_PAGO: Record<TipoMedioPagoApi, true> = {
  EFECTIVO: true,
  TRANSFERENCIA: true,
  TARJETA: true,
  BILLETERA_VIRTUAL: true,
}
export const esTipoMedioPagoApi = (valor: unknown): valor is TipoMedioPagoApi =>
  esClaveDe(TIPOS_MEDIO_PAGO, valor)

// --- TRADUCCIONES ---
export const convertirOrigenACanal = (origen: OrigenApi) => CANAL_POR_ORIGEN[origen]
export const convertirCanalAOrigen = (canalVenta: CanalVenta) => ORIGEN_POR_CANAL[canalVenta]
export const convertirModalidadAEntrega = (modalidad: ModalidadEntregaApi) =>
  ENTREGA_POR_MODALIDAD[modalidad]
export const convertirEntregaAModalidad = (tipoEntrega: TipoEntrega) =>
  MODALIDAD_POR_ENTREGA[tipoEntrega]
export const convertirFormatoApiAFormato = (formato: FormatoVentaApi) =>
  FORMATO_POR_FORMATO_API[formato]
export const convertirEstadoApiAEstado = (estado: EstadoVentaApi) => ESTADO_POR_ESTADO_API[estado]
