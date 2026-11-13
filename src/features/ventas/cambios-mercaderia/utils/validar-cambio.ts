import { MENSAJE_PRECIO_IGUAL_O_MAYOR } from '@/features/ventas/cambios-mercaderia/config/reglas-cambios'
import type {
  ArticuloDevueltoCargado,
  ArticuloEntregadoCargado,
  BorradorCambio,
  PasoAltaCambio,
  ResumenSaldoCambio,
  ValidacionCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import type { MedioPago } from '@/features/ventas/types/cobro'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { esMotivoValido } from '@/features/ventas/utils/motivos-venta'

const formateadorCantidad = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 3 })

type ErroresCampo = ValidacionCambio['erroresCampo']

/** Valida lo cargado en el articulo devuelto. Devuelve el error del campo y el motivo de bloqueo. */
function validarArticuloDevuelto(articulo: ArticuloDevueltoCargado | null) {
  if (articulo === null) {
    return { motivo: 'Elegí el artículo que devuelve el cliente.', errores: {} as ErroresCampo }
  }

  // --- BOLSA ABIERTA: SE VALIDA EL PESO REAL ---
  if (articulo.esBolsaAbierta && articulo.opcionBolsaAbierta !== null) {
    const pesoNominal = articulo.opcionBolsaAbierta.pesoNominalKg
    const peso = articulo.pesoDevueltoKg
    if (peso === null) {
      return { motivo: 'Ingresá el peso devuelto de la bolsa.', errores: {} as ErroresCampo }
    }
    if (peso <= 0) {
      return {
        motivo: 'El peso devuelto tiene que ser mayor a 0.',
        errores: { pesoDevuelto: 'El peso tiene que ser mayor a 0.' } as ErroresCampo,
      }
    }
    if (peso > pesoNominal) {
      const mensaje = `El peso no puede superar los ${formateadorCantidad.format(pesoNominal)} kg de la bolsa.`
      return { motivo: mensaje, errores: { pesoDevuelto: mensaje } as ErroresCampo }
    }
    return { motivo: null, errores: {} as ErroresCampo }
  }

  // --- CANTIDAD ---
  const cantidad = articulo.cantidad
  const unidad = articulo.formatoVenta === 'GRANEL' ? 'kg' : 'u'
  if (cantidad === null || cantidad <= 0) {
    return {
      motivo: 'Ingresá la cantidad que devuelve el cliente.',
      errores: (cantidad === null ? {} : { cantidadDevuelta: 'La cantidad tiene que ser mayor a 0.' }) as ErroresCampo,
    }
  }
  const maximo = articulo.cantidadMaximaDisponible
  if (maximo !== null && cantidad > maximo) {
    const mensaje =
      maximo === 0
        ? 'Ya se devolvió todo lo que vendió esta venta.'
        : `Solo quedan ${formateadorCantidad.format(maximo)} ${unidad} por devolver de esta venta.`
    return { motivo: mensaje, errores: { cantidadDevuelta: mensaje } as ErroresCampo }
  }
  return { motivo: null, errores: {} as ErroresCampo }
}

function validarArticuloEntregado(articulo: ArticuloEntregadoCargado | null) {
  if (articulo === null) {
    return { motivo: 'Elegí el artículo que se lleva el cliente.', errores: {} as ErroresCampo }
  }
  if (articulo.cantidad === null || articulo.cantidad <= 0) {
    return {
      motivo: 'Ingresá la cantidad que se lleva el cliente.',
      errores: (articulo.cantidad === null ? {} : { cantidadEntregada: 'La cantidad tiene que ser mayor a 0.' }) as ErroresCampo,
    }
  }
  // Sin stock no se puede entregar: el buscador ya no deja elegirlo, pero una edicion puede traerlo cargado
  const unidad = articulo.formatoVenta === 'GRANEL' ? 'kg' : 'u'
  if (articulo.stockDisponible <= 0) {
    const mensaje = 'El artículo elegido no tiene stock.'
    return { motivo: mensaje, errores: { cantidadEntregada: mensaje } as ErroresCampo }
  }
  if (articulo.cantidad > articulo.stockDisponible) {
    const mensaje = `Solo hay ${formateadorCantidad.format(articulo.stockDisponible)} ${unidad} en stock.`
    return { motivo: mensaje, errores: { cantidadEntregada: mensaje } as ErroresCampo }
  }
  return { motivo: null, errores: {} as ErroresCampo }
}

/**
 * Decide que se puede hacer con lo cargado: avanzar a cada paso y confirmar. La regla de precio
 * (solo igual o mayor valor) bloquea con un mensaje claro; no existen reembolsos.
 * motivoNoAvanzar explica el bloqueo del paso en el que esta el usuario.
 */
export function validarCambio(
  borrador: BorradorCambio,
  resumen: ResumenSaldoCambio,
  medioSeleccionado: MedioPago | undefined,
  paso: PasoAltaCambio,
): ValidacionCambio {
  const devuelto = validarArticuloDevuelto(borrador.articuloDevuelto)
  const entregado = validarArticuloEntregado(borrador.articuloEntregado)
  const erroresCampo: ErroresCampo = { ...devuelto.errores, ...entregado.errores }

  // --- PASO ARTICULOS ---
  let motivoArticulos = devuelto.motivo ?? entregado.motivo
  if (motivoArticulos === null && resumen.situacion === 'NEGATIVO') {
    motivoArticulos = MENSAJE_PRECIO_IGUAL_O_MAYOR
  }
  const articulosCompletos = motivoArticulos === null

  // --- PASO COBRO ---
  let motivoCobro: string | null = null
  if (resumen.situacion === 'A_COBRAR') {
    if (borrador.idMedioPago === null) {
      motivoCobro = `Elegí con qué medio de pago abona la diferencia de ${formatearMoneda(resumen.saldo)}.`
    } else if (medioSeleccionado?.admiteVuelto) {
      if (borrador.montoRecibido === null) {
        motivoCobro = 'Ingresá el monto con el que paga el cliente.'
      } else if (borrador.montoRecibido < resumen.saldo) {
        const mensaje = `El monto recibido no alcanza para cubrir ${formatearMoneda(resumen.saldo)}.`
        erroresCampo.montoRecibido = mensaje
        motivoCobro = mensaje
      }
    }
  }
  const cobroCompleto = motivoCobro === null

  // --- PASO MOTIVO (EL PRIMERO) ---
  const motivoValido = esMotivoValido(borrador.codigoMotivo, borrador.detalleMotivo)
  const motivoDelCambio = motivoValido
    ? null
    : borrador.codigoMotivo === null
      ? 'Elegí el motivo del cambio.'
      : 'Escribí el motivo del cambio.'

  // Se sale de cada paso cuando esta completo; confirmar exige todos
  const puedeAvanzar: Record<PasoAltaCambio, boolean> = {
    MOTIVO: motivoValido,
    VENTA_ORIGINAL: true,
    ARTICULOS: articulosCompletos,
    COBRO: motivoValido && articulosCompletos && cobroCompleto,
  }

  const motivoNoAvanzarPorPaso: Record<PasoAltaCambio, string | null> = {
    MOTIVO: motivoDelCambio,
    VENTA_ORIGINAL: null,
    ARTICULOS: motivoArticulos,
    COBRO: motivoDelCambio ?? motivoArticulos ?? motivoCobro,
  }

  return {
    puedeAvanzar,
    puedeConfirmar: puedeAvanzar.COBRO,
    motivoNoAvanzar: motivoNoAvanzarPorPaso[paso],
    erroresCampo,
  }
}
