import {
  calcularFaltanteFiadoCentavos,
  calcularPagadoFiadoCentavos,
  calcularSaldoDeudorCentavos,
  filtrarFiadosPendientes,
  leerDeudorAlmacenado,
} from '@/features/ventas/deudores/ejemplos/almacen-deudores-ejemplo'
import {
  armarNumeroComprobanteEjemplo,
  armarNumeroReciboEjemplo,
} from '@/features/ventas/deudores/ejemplos/datos-deudores-ejemplo'
import {
  ID_DEUDOR_INEXISTENTE_AL_CONFIRMAR_EJEMPLO,
  ID_VENTA_FIADO_CAJA_CERRADA_EJEMPLO,
  ID_VENTA_FIADO_MONTO_SUPERA_FALTANTE_EJEMPLO,
  ID_VENTA_FIADO_YA_NO_PENDIENTE_EJEMPLO,
} from '@/features/ventas/deudores/ejemplos/disparadores-ejemplo'
import { escribirEstadoAlmacen, leerEstadoAlmacen } from '@/features/ventas/deudores/ejemplos/estado-almacen-ejemplo'
import type { FiadoAlmacenado } from '@/features/ventas/deudores/ejemplos/tipos-almacen-ejemplo'
import type { ErrorCobroDeudor, FiadoAbonado, MotivoRechazoCobro } from '@/features/ventas/deudores/types/cobro-deudor'
import type { FiadoOrigenHistorial, FiadoPendiente } from '@/features/ventas/deudores/types/cuenta-corriente'
import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import { esFechaPasada, obtenerFechaHoy } from '@/features/ventas/deudores/utils/fechas-estimadas'
import { convertirCentavosAPesos, convertirPesosACentavos } from '@/features/ventas/utils/calcular-centavos'

// Cuenta corriente del almacen de deudores. Hace el papel del estado de cuenta, del alta de una venta con deuda y
// del cobro de fiados, que el back todavia no tiene.

// --- LECTURA DE LA FICHA ---
function convertirAFiadoPendiente(fiado: FiadoAlmacenado, hoy: string): FiadoPendiente {
  return {
    idVenta: fiado.idVenta,
    numeroComprobante: fiado.numeroComprobante,
    fechaHora: fiado.fechaHora,
    fechaEstimadaPago: fiado.fechaEstimadaPago,
    fechaEstimadaVencida: fiado.fechaEstimadaPago !== null && esFechaPasada(fiado.fechaEstimadaPago, hoy),
    importeAdeudado: convertirCentavosAPesos(fiado.importeAdeudadoCentavos),
    montoPagado: convertirCentavosAPesos(calcularPagadoFiadoCentavos(fiado)),
    montoFaltante: convertirCentavosAPesos(calcularFaltanteFiadoCentavos(fiado)),
    pagos: fiado.pagos.map((pago) => ({
      fechaHora: pago.fechaHora,
      monto: convertirCentavosAPesos(pago.montoCentavos),
      numeroRecibo: pago.numeroRecibo,
    })),
  }
}

/** Datos de la ficha de un deudor: el deudor, su saldo y sus fiados pendientes (los mas viejos primero). */
export interface FichaDeudorAlmacenada {
  deudor: Deudor
  saldo: number
  fiados: FiadoPendiente[]
}

/** GET del estado de cuenta; null si el deudor no existe (404). */
export function leerFichaDeudor(idDeudor: number): FichaDeudorAlmacenada | null {
  const almacenado = leerDeudorAlmacenado(idDeudor)
  if (almacenado === null) return null
  const hoy = obtenerFechaHoy()
  const pendientes = [...filtrarFiadosPendientes(almacenado.fiados)].sort((primero, segundo) =>
    primero.fechaHora.localeCompare(segundo.fechaHora),
  )
  return {
    deudor: almacenado.deudor,
    saldo: convertirCentavosAPesos(calcularSaldoDeudorCentavos(almacenado)),
    fiados: pendientes.map((fiado) => convertirAFiadoPendiente(fiado, hoy)),
  }
}

/**
 * Agrega a un deudor el fiado que vio el Historial, si todavia no lo tiene. Es solo de la maqueta: con el back real
 * el fiado ya esta en la cuenta del deudor.
 */
export function asegurarFiadoDeHistorial(idDeudor: number, origen: FiadoOrigenHistorial) {
  const almacenado = leerDeudorAlmacenado(idDeudor)
  if (almacenado === null || almacenado.fiados.some((fiado) => fiado.idVenta === origen.idVenta)) return

  // El Historial solo sabe cuanto se pago: se toma como el pago inicial, que tiene su propio recibo
  const hayPagoInicial = origen.montoPagado > 0
  const numeroReciboPagoInicial = armarNumeroReciboEjemplo(leerEstadoAlmacen().proximoIdCobro)
  const fiadoNuevo: FiadoAlmacenado = {
    idVenta: origen.idVenta,
    numeroComprobante: origen.numeroComprobante,
    fechaHora: origen.fechaHora,
    fechaEstimadaPago: origen.fechaEstimadaPago,
    importeAdeudadoCentavos: convertirPesosACentavos(origen.importeAdeudado),
    pagos: hayPagoInicial
      ? [
          {
            fechaHora: origen.fechaHora,
            montoCentavos: convertirPesosACentavos(origen.montoPagado),
            numeroRecibo: numeroReciboPagoInicial,
          },
        ]
      : [],
  }
  escribirEstadoAlmacen((estado) => ({
    ...estado,
    proximoIdCobro: estado.proximoIdCobro + (hayPagoInicial ? 1 : 0),
    deudores: estado.deudores.map((deudor) =>
      deudor.deudor.idDeudor === idDeudor ? { ...deudor, fiados: [...deudor.fiados, fiadoNuevo] } : deudor,
    ),
  }))
}

// --- ALTA DE UNA VENTA CON DEUDA ---
/** Lo que se registra al confirmar una venta con deuda. */
export interface VentaConDeudaARegistrar {
  idDeudor: number
  importeVentaCentavos: number
  /** Lo que se pago ahora, en porciones base; 0 si no pago nada. */
  pagadoAhoraBaseCentavos: number
  fechaEstimadaPago: string | null
}

/** Resultado de POST /api/ventas con deuda. */
export type ResultadoRegistroConDeudaEjemplo =
  | {
      tipo: 'registrada'
      idVenta: number
      numeroComprobante: string
      fechaHora: string
      /** Recibo del pago inicial (REC-...); null si no se pago nada ahora. */
      numeroReciboPagoInicial: string | null
    }
  /** 404: el deudor no existe. */
  | { tipo: 'deudor-no-encontrado' }

/** Registra la venta con deuda: queda como fiado pendiente en la cuenta del deudor. */
export function registrarVentaConDeudaAlmacenada(venta: VentaConDeudaARegistrar): ResultadoRegistroConDeudaEjemplo {
  const almacenado = leerDeudorAlmacenado(venta.idDeudor)
  if (almacenado === null || venta.idDeudor === ID_DEUDOR_INEXISTENTE_AL_CONFIRMAR_EJEMPLO) {
    return { tipo: 'deudor-no-encontrado' }
  }

  const { proximoIdVenta: idVenta, proximoIdCobro } = leerEstadoAlmacen()
  const fechaHora = new Date().toISOString()
  // Como en el back: el pago inicial es un cobro del fiado recien creado, y genera su recibo
  const hayPagoInicial = venta.pagadoAhoraBaseCentavos > 0
  const numeroReciboPagoInicial = hayPagoInicial ? armarNumeroReciboEjemplo(proximoIdCobro) : null
  const fiadoNuevo: FiadoAlmacenado = {
    idVenta,
    numeroComprobante: armarNumeroComprobanteEjemplo(idVenta),
    fechaHora,
    fechaEstimadaPago: venta.fechaEstimadaPago,
    importeAdeudadoCentavos: venta.importeVentaCentavos,
    pagos:
      numeroReciboPagoInicial === null
        ? []
        : [{ fechaHora, montoCentavos: venta.pagadoAhoraBaseCentavos, numeroRecibo: numeroReciboPagoInicial }],
  }
  escribirEstadoAlmacen((estado) => ({
    ...estado,
    proximoIdVenta: estado.proximoIdVenta + 1,
    proximoIdCobro: estado.proximoIdCobro + (hayPagoInicial ? 1 : 0),
    deudores: estado.deudores.map((deudor) =>
      deudor.deudor.idDeudor === venta.idDeudor
        ? { ...deudor, fiados: [...deudor.fiados, fiadoNuevo] }
        : deudor,
    ),
  }))
  return {
    tipo: 'registrada',
    idVenta,
    numeroComprobante: fiadoNuevo.numeroComprobante,
    fechaHora,
    numeroReciboPagoInicial,
  }
}

// --- COBRO DE FIADOS ---
/** Cuanto se abona a un fiado en un cobro. */
export interface FiadoACobrar {
  idVenta: number
  montoCentavos: number
}

/** Resultado de POST /api/deudores/:idDeudor/cobros. */
export type ResultadoCobroEjemplo =
  | {
      tipo: 'cobrado'
      idCobro: number
      numeroRecibo: string
      fechaHora: string
      fiadosAbonados: FiadoAbonado[]
      saldoRestanteCentavos: number
    }
  | { tipo: 'rechazado'; error: ErrorCobroDeudor }

const MENSAJES_RECHAZO: Record<MotivoRechazoCobro, { mensaje: string; reintentable: boolean }> = {
  FIADO_NO_PENDIENTE: {
    mensaje: 'Uno de los fiados ya no está pendiente. No se cobró ninguno: actualizá la cuenta y revisá lo que falta.',
    reintentable: false,
  },
  MONTO_SUPERA_FALTANTE: {
    mensaje: 'El monto de un fiado supera lo que falta cobrar. No se cobró ninguno: actualizá la cuenta y revisá los montos.',
    reintentable: false,
  },
  CAJA_CERRADA: {
    mensaje: 'No hay una caja abierta. No se cobró ningún fiado: abrí la caja y volvé a intentar.',
    reintentable: true,
  },
  DESCONOCIDO: {
    mensaje: 'No pudimos registrar el cobro. No se cobró ningún fiado: intentá de nuevo.',
    reintentable: true,
  },
}

function crearRechazo(motivo: MotivoRechazoCobro, estadoHttp: 404 | 409 = 409): ResultadoCobroEjemplo {
  return { tipo: 'rechazado', error: { estadoHttp, motivo, ...MENSAJES_RECHAZO[motivo] } }
}

/** Decide si el cobro se rechaza. Todo o nada: alcanza con un fiado en problemas para no cobrar ninguno. */
function buscarMotivoDeRechazo(fiadosACobrar: FiadoACobrar[], fiadosDelDeudor: FiadoAlmacenado[]) {
  for (const fiadoACobrar of fiadosACobrar) {
    if (fiadoACobrar.idVenta === ID_VENTA_FIADO_YA_NO_PENDIENTE_EJEMPLO) return 'FIADO_NO_PENDIENTE'
    if (fiadoACobrar.idVenta === ID_VENTA_FIADO_MONTO_SUPERA_FALTANTE_EJEMPLO) return 'MONTO_SUPERA_FALTANTE'
    if (fiadoACobrar.idVenta === ID_VENTA_FIADO_CAJA_CERRADA_EJEMPLO) return 'CAJA_CERRADA'

    const fiado = fiadosDelDeudor.find((candidato) => candidato.idVenta === fiadoACobrar.idVenta)
    if (fiado === undefined || calcularFaltanteFiadoCentavos(fiado) === 0) return 'FIADO_NO_PENDIENTE'
    if (fiadoACobrar.montoCentavos > calcularFaltanteFiadoCentavos(fiado)) return 'MONTO_SUPERA_FALTANTE'
  }
  return null
}

/** Cobra uno o mas fiados de un deudor, cada uno por su monto; un fiado a medias sigue pendiente y en cero se completa. */
export function cobrarFiadosAlmacenados(idDeudor: number, fiadosACobrar: FiadoACobrar[]): ResultadoCobroEjemplo {
  const almacenado = leerDeudorAlmacenado(idDeudor)
  if (almacenado === null) return crearRechazo('DESCONOCIDO', 404)

  const motivo = buscarMotivoDeRechazo(fiadosACobrar, almacenado.fiados)
  if (motivo !== null) return crearRechazo(motivo)

  const idCobro = leerEstadoAlmacen().proximoIdCobro
  const numeroRecibo = armarNumeroReciboEjemplo(idCobro)
  const fechaHora = new Date().toISOString()
  const montoPorFiado = new Map(fiadosACobrar.map((fiado) => [fiado.idVenta, fiado.montoCentavos]))
  const fiadosActualizados = almacenado.fiados.map((fiado) => {
    const montoCentavos = montoPorFiado.get(fiado.idVenta)
    return montoCentavos === undefined
      ? fiado
      : { ...fiado, pagos: [...fiado.pagos, { fechaHora, montoCentavos, numeroRecibo }] }
  })
  const fiadosAbonados: FiadoAbonado[] = fiadosActualizados
    .filter((fiado) => montoPorFiado.has(fiado.idVenta))
    .map((fiado) => {
      const faltante = calcularFaltanteFiadoCentavos(fiado)
      return {
        idVenta: fiado.idVenta,
        numeroComprobante: fiado.numeroComprobante,
        montoAbonado: convertirCentavosAPesos(montoPorFiado.get(fiado.idVenta) ?? 0),
        montoFaltanteResultante: convertirCentavosAPesos(faltante),
        estadoResultante: faltante === 0 ? 'COMPLETADA' : 'PENDIENTE_PAGO',
      }
    })

  escribirEstadoAlmacen((estado) => ({
    ...estado,
    proximoIdCobro: estado.proximoIdCobro + 1,
    deudores: estado.deudores.map((deudor) =>
      deudor.deudor.idDeudor === idDeudor ? { ...deudor, fiados: fiadosActualizados } : deudor,
    ),
  }))
  return {
    tipo: 'cobrado',
    idCobro,
    numeroRecibo,
    fechaHora,
    fiadosAbonados,
    saldoRestanteCentavos: calcularSaldoDeudorCentavos({ ...almacenado, fiados: fiadosActualizados }),
  }
}
