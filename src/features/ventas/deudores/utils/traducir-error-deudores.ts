import type { ErrorApi } from '@/lib/cliente-http.types'
import { esObjeto } from '@/lib/es-objeto'
import { convertirDeudorApi, esDeudorApi } from '@/features/ventas/deudores/api/conversores-deudores'
import {
  MENSAJE_COBRO_DATOS_INVALIDOS,
  MENSAJE_COBRO_DEUDOR_NO_ENCONTRADO,
  MENSAJE_COBRO_FALLIDO,
  MENSAJE_COBRO_FIADO_CAMBIO,
  MENSAJE_COBRO_MEDIO_NO_DISPONIBLE,
  MENSAJE_COBRO_MONTO_EXCEDE,
  MENSAJE_COBRO_SIMULTANEO,
  MENSAJE_COBRO_SIN_CAJA,
  MENSAJE_COBRO_SIN_PERMISO,
  MENSAJE_DEUDOR_INEXISTENTE,
  MENSAJE_FECHA_ESTIMADA_ANTERIOR,
  MENSAJE_FIADO_NO_REGISTRADO,
  MENSAJE_GUARDADO_DEUDOR_FALLIDO,
  MENSAJE_SIN_PERMISO_REGISTRAR_FIADO,
  MENSAJE_SIN_PERMISO_GUARDAR_DEUDOR,
  MENSAJES_CAMPO_DEUDOR_INVALIDO,
} from '@/features/ventas/deudores/config/mensajes-deudores'
import type {
  ErrorCobroDeudor,
  MotivoRechazoCobro,
  ResultadoCobroDeudor,
} from '@/features/ventas/deudores/types/cobro-deudor'
import type { CampoDeudor, ErroresDatosDeudor, EstadoGuardadoDeudor } from '@/features/ventas/deudores/types/deudor'
import {
  crearMensajeStockInsuficiente,
  MENSAJE_DATOS_NO_COINCIDEN,
  MENSAJE_ITEM_NO_DISPONIBLE,
  MENSAJE_PRODUCTO_SIN_NOMBRE,
} from '@/features/ventas/config/mensajes-error-venta'
import type { ArticuloCarrito } from '@/features/ventas/types/venta'

const ESTADO_NO_AUTORIZADO = 401
const ESTADO_DATOS_INVALIDOS = 400
const ESTADO_SIN_PERMISO = 403
const ESTADO_NO_ENCONTRADO = 404
const ESTADO_CONFLICTO = 409
const PRIMER_ESTADO_ERROR_SERVIDOR = 500

/** Verdadero si el back respondio con un 4xx: el pedido se rechazo y no se guardo nada. */
export function esRechazoDelServidor(error: ErrorApi) {
  return (
    error.tipo === 'RESPUESTA_DEL_SERVIDOR' &&
    error.estado !== null &&
    error.estado < PRIMER_ESTADO_ERROR_SERVIDOR
  )
}

// --- ALTA Y EDICION DE UN DEUDOR ---

const CAMPOS_DEUDOR: CampoDeudor[] = ['nombreCompleto', 'telefono', 'dni']

/** Pasa los campos que el back marco como invalidos a un texto propio por campo; ignora los que no conoce. */
function leerErroresCampos(error: ErrorApi): ErroresDatosDeudor {
  return error.errores.reduce<ErroresDatosDeudor>((acumulado, errorCampo) => {
    const campo = CAMPOS_DEUDOR.find((candidato) => candidato === errorCampo.campo)
    return campo === undefined ? acumulado : { ...acumulado, [campo]: MENSAJES_CAMPO_DEUDOR_INVALIDO[campo] }
  }, {})
}

/** El deudor que ya tiene ese DNI, tal como lo manda el 409 en el cuerpo; undefined si no tiene la forma esperada. */
function leerDeudorExistente(error: ErrorApi) {
  const { cuerpo } = error
  return esObjeto(cuerpo) && esDeudorApi(cuerpo.deudorExistente) ? convertirDeudorApi(cuerpo.deudorExistente) : undefined
}

/** Traduce un error del alta o la edicion de un deudor a su estado de guardado. Nunca repite lo que escribio la persona. */
export function traducirErrorGuardadoDeudor(error: ErrorApi): EstadoGuardadoDeudor {
  if (error.estado === ESTADO_CONFLICTO && error.codigo === 'DNI_DUPLICADO') {
    const deudorExistente = leerDeudorExistente(error)
    if (deudorExistente !== undefined) return { fase: 'dni-duplicado', deudorExistente }
  }
  if (error.estado === ESTADO_NO_ENCONTRADO && error.codigo === 'DEUDOR_NO_ENCONTRADO') {
    return { fase: 'no-encontrado' }
  }
  if (error.estado === ESTADO_SIN_PERMISO) return { fase: 'error', mensaje: MENSAJE_SIN_PERMISO_GUARDAR_DEUDOR }
  if (error.estado === ESTADO_DATOS_INVALIDOS) {
    const erroresCampos = leerErroresCampos(error)
    return Object.keys(erroresCampos).length > 0
      ? { fase: 'error', mensaje: MENSAJE_GUARDADO_DEUDOR_FALLIDO, erroresCampos }
      : { fase: 'error', mensaje: MENSAJE_GUARDADO_DEUDOR_FALLIDO }
  }
  return { fase: 'error', mensaje: MENSAJE_GUARDADO_DEUDOR_FALLIDO }
}

// --- COBRO DE FIADOS ---

interface DescripcionRechazo {
  estadoHttp: ErrorCobroDeudor['estadoHttp']
  motivo: MotivoRechazoCobro
  mensaje: string
  reintentable?: boolean
  refrescarFicha?: boolean
}

function crearRechazo(descripcion: DescripcionRechazo): ResultadoCobroDeudor {
  const { reintentable = false, refrescarFicha = false, ...resto } = descripcion
  return { tipo: 'rechazado', error: { ...resto, reintentable, refrescarFicha } }
}

/**
 * Traduce un error de POST /api/cuentas-corrientes/:idDeudor/cobros. Un 4xx significa que no se guardo nada (el
 * cobro es todo o nada). Sin respuesta util el cobro pudo haberse guardado: es incierto y se verifica con la ficha.
 */
export function traducirErrorCobro(error: ErrorApi): ResultadoCobroDeudor {
  if (error.estado === ESTADO_NO_AUTORIZADO) {
    // El cliente ya cerro la sesion: la pantalla de acceso reemplaza a esta
    return crearRechazo({ estadoHttp: 401, motivo: 'DESCONOCIDO', mensaje: MENSAJE_COBRO_FALLIDO })
  }
  if (!esRechazoDelServidor(error)) return { tipo: 'incierto' }

  switch (error.codigo) {
    case 'FIADO_NO_ENCONTRADO':
    case 'FIADO_NO_PENDIENTE':
      return crearRechazo({
        estadoHttp: error.estado === ESTADO_NO_ENCONTRADO ? 404 : 409,
        motivo: error.codigo,
        mensaje: MENSAJE_COBRO_FIADO_CAMBIO,
        refrescarFicha: true,
      })
    case 'MONTO_EXCEDE_FALTA':
      return crearRechazo({
        estadoHttp: 409,
        motivo: 'MONTO_EXCEDE_FALTA',
        mensaje: MENSAJE_COBRO_MONTO_EXCEDE,
        refrescarFicha: true,
      })
    case 'SIN_CAJA_ABIERTA':
      return crearRechazo({ estadoHttp: 409, motivo: 'SIN_CAJA_ABIERTA', mensaje: MENSAJE_COBRO_SIN_CAJA, reintentable: true })
    case 'COBRO_SIMULTANEO':
      return crearRechazo({ estadoHttp: 409, motivo: 'COBRO_SIMULTANEO', mensaje: MENSAJE_COBRO_SIMULTANEO, reintentable: true })
    case 'DEUDOR_NO_ENCONTRADO':
      return crearRechazo({ estadoHttp: 404, motivo: 'DEUDOR_NO_ENCONTRADO', mensaje: MENSAJE_COBRO_DEUDOR_NO_ENCONTRADO })
  }

  // Sin codigo: los errores de los pagos y de los medios mantienen el formato de ventas
  if (error.estado === ESTADO_SIN_PERMISO) {
    return crearRechazo({ estadoHttp: 403, motivo: 'SIN_PERMISO', mensaje: MENSAJE_COBRO_SIN_PERMISO })
  }
  if (error.estado === ESTADO_DATOS_INVALIDOS) {
    return crearRechazo({ estadoHttp: 400, motivo: 'DATOS_INVALIDOS', mensaje: MENSAJE_COBRO_DATOS_INVALIDOS })
  }
  if (error.estado === ESTADO_NO_ENCONTRADO) {
    return crearRechazo({ estadoHttp: 404, motivo: 'MEDIO_PAGO_NO_DISPONIBLE', mensaje: MENSAJE_COBRO_MEDIO_NO_DISPONIBLE })
  }
  return crearRechazo({ estadoHttp: 409, motivo: 'DESCONOCIDO', mensaje: MENSAJE_COBRO_FALLIDO })
}

// --- ALTA DEL FIADO (PASO 1 DE UNA VENTA CON DEUDA) ---

/** Como termino el alta del fiado: el back la rechazo sin guardar nada, o no hay respuesta util y puede haberse guardado. */
export type ResultadoAltaFiadoFallida =
  | { tipo: 'rechazado'; estadoHttp: 400 | 401 | 403 | 404 | 409; mensaje: string; reintentable: boolean }
  | { tipo: 'incierto' }

/** Formato del 409 de stock del back: "Stock insuficiente para el producto 7". */
const PATRON_STOCK_INSUFICIENTE = /^Stock insuficiente para el producto (\d+)$/

/**
 * Traduce un error de POST /api/ventas con deuda. Un 4xx significa que no se guardo nada (la transaccion es atomica);
 * cualquier otra falla deja en duda si la venta se guardo. A diferencia de una venta de contado, un fiado total no
 * exige caja: un 409 solo puede ser el stock.
 */
export function traducirErrorAltaFiado(error: ErrorApi, articulos: ArticuloCarrito[]): ResultadoAltaFiadoFallida {
  if (error.estado === ESTADO_NO_AUTORIZADO) {
    // El cliente ya cerro la sesion: la pantalla de acceso reemplaza a esta
    return { tipo: 'rechazado', estadoHttp: 401, mensaje: MENSAJE_FIADO_NO_REGISTRADO, reintentable: false }
  }
  if (!esRechazoDelServidor(error)) return { tipo: 'incierto' }

  if (error.estado === ESTADO_SIN_PERMISO) {
    return { tipo: 'rechazado', estadoHttp: 403, mensaje: MENSAJE_SIN_PERMISO_REGISTRAR_FIADO, reintentable: false }
  }
  if (error.estado === ESTADO_NO_ENCONTRADO) {
    // El deudor se evalua antes que el stock: no se descuenta nada
    return error.codigo === 'DEUDOR_NO_ENCONTRADO'
      ? { tipo: 'rechazado', estadoHttp: 404, mensaje: MENSAJE_DEUDOR_INEXISTENTE, reintentable: false }
      : { tipo: 'rechazado', estadoHttp: 404, mensaje: MENSAJE_ITEM_NO_DISPONIBLE, reintentable: false }
  }
  if (error.estado === ESTADO_CONFLICTO) {
    const coincidencia = PATRON_STOCK_INSUFICIENTE.exec(error.mensaje ?? '')
    if (coincidencia !== null) {
      const articulo = articulos.find((candidato) => candidato.idProducto === coincidencia[1])
      return {
        tipo: 'rechazado',
        estadoHttp: 409,
        mensaje: crearMensajeStockInsuficiente(articulo?.nombreProducto ?? MENSAJE_PRODUCTO_SIN_NOMBRE),
        reintentable: false,
      }
    }
    return { tipo: 'rechazado', estadoHttp: 409, mensaje: MENSAJE_FIADO_NO_REGISTRADO, reintentable: true }
  }
  if (error.estado === ESTADO_DATOS_INVALIDOS) {
    // La fecha anterior a hoy llega sin errores[]: se reconoce por su mensaje, que no se muestra
    const esFechaEstimada =
      error.errores.some((errorCampo) => errorCampo.campo === 'fechaEstimadaPago') ||
      /fecha estimada/i.test(error.mensaje ?? '')
    return {
      tipo: 'rechazado',
      estadoHttp: 400,
      mensaje: esFechaEstimada ? MENSAJE_FECHA_ESTIMADA_ANTERIOR : MENSAJE_DATOS_NO_COINCIDEN,
      reintentable: false,
    }
  }
  return { tipo: 'rechazado', estadoHttp: 409, mensaje: MENSAJE_FIADO_NO_REGISTRADO, reintentable: true }
}
