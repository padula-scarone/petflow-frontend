import type { RegistrarCambioRequest } from '@/features/ventas/cambios-mercaderia/types/api-cambios'
import type {
  CambioMercaderiaDetalle,
  CambioMercaderiaListado,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import { MARGEN_VERIFICACION_MILISEGUNDOS } from '@/features/ventas/config/reglas-venta'
import { convertirPesosACentavos } from '@/features/ventas/utils/calcular-centavos'

// Cuando el resultado de una anulacion o un alta es incierto (sin red, tiempo agotado, 5xx, respuesta ilegible)
// o el back responde 409 a una anulacion, se consulta para saber que paso de verdad. Se compara contra lo que
// se envio: asi un 409 que es la repeticion de una anulacion que si se guardo no se muestra como error, y un
// alta incierta no se reenvia a ciegas (el back no tiene clave de idempotencia: reintentar puede duplicar).

const MILESIMAS_POR_UNIDAD = 1000
const ZONA_HORARIA_NEGOCIO = 'America/Argentina/Buenos_Aires'

// --- ANULACION ---

/** Lo que se envio al anular, para reconocer la propia anulacion en el detalle. */
export interface EnvioAnulacionCambio {
  /** Texto exacto enviado como motivo. */
  motivo: string
  idUsuario: number
  /** Hora del servidor (estimada) en que salio el pedido, en milisegundos. */
  enviadoEnMilisegundos: number
}

export type VerificacionAnulacionCambio =
  /** El cambio quedo anulado por este usuario con este motivo: la accion se aplico. */
  | { tipo: 'aplicada'; huboSaldo: boolean }
  /** Ya estaba anulado por otra persona (u otro pedido). */
  | { tipo: 'anulada-por-otro'; nombreUsuario: string | null }
  /** Sigue ACTIVO; `ventanaVencida` dice si el servidor ya no lo deja anular por el plazo. */
  | { tipo: 'no-aplicada'; ventanaVencida: boolean }

/**
 * Decide que paso con una anulacion a partir del detalle del cambio.
 * @param ahoraServidorMilisegundos Hora del servidor al responder el detalle.
 */
export function verificarAnulacionCambioAplicada(
  cambio: CambioMercaderiaDetalle,
  envio: EnvioAnulacionCambio,
  ahoraServidorMilisegundos: number,
): VerificacionAnulacionCambio {
  if (cambio.estado !== 'ANULADO') {
    const limite = cambio.fechaHoraLimiteModificacion
    return {
      tipo: 'no-aplicada',
      ventanaVencida: limite !== null && Date.parse(limite) <= ahoraServidorMilisegundos,
    }
  }
  const { anulacion } = cambio
  const esPropia =
    anulacion !== null &&
    anulacion.motivo === envio.motivo &&
    anulacion.idUsuario === envio.idUsuario &&
    Date.parse(anulacion.fechaHora) >= envio.enviadoEnMilisegundos - MARGEN_VERIFICACION_MILISEGUNDOS
  if (esPropia) return { tipo: 'aplicada', huboSaldo: cambio.saldoResultante > 0 }
  return { tipo: 'anulada-por-otro', nombreUsuario: anulacion?.nombreUsuario ?? null }
}

// --- ALTA ---

/** Lo que se envio al registrar, para reconocer el propio cambio en la lista y en el detalle. */
export interface EnvioAltaCambio {
  cuerpo: RegistrarCambioRequest
  /** Saldo que calculo la pantalla, en centavos: el back calcula el mismo. */
  saldoEsperadoCentavos: number
  idUsuario: number
  /** Hora del servidor (estimada) en que salio el pedido, en milisegundos. */
  enviadoEnMilisegundos: number
}

const aMilesimas = (cantidad: number) => Math.round(cantidad * MILESIMAS_POR_UNIDAD)

/** Fecha AAAA-MM-DD en hora de Argentina, la que usan los filtros del back. */
export function formatearFechaArgentina(milisegundos: number) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HORARIA_NEGOCIO }).format(new Date(milisegundos))
}

/**
 * Indica si una fila de la lista coincide con lo enviado: mismos productos, cantidades, peso, venta y saldo, y
 * cargada despues del envio. La fila no trae el vendedor ni el motivo: eso se confirma con el detalle.
 */
export function coincideFilaConEnvio(fila: CambioMercaderiaListado, envio: EnvioAltaCambio) {
  const { cuerpo } = envio
  return (
    fila.productoDevuelto.idProducto === cuerpo.idProductoDevuelto &&
    fila.productoDevuelto.esBolsaAbierta === cuerpo.esBolsaAbierta &&
    aMilesimas(fila.productoDevuelto.cantidad) === aMilesimas(cuerpo.cantidadDevuelta) &&
    (cuerpo.pesoDevuelto === undefined ||
      (fila.productoDevuelto.pesoDevueltoKg !== null &&
        aMilesimas(fila.productoDevuelto.pesoDevueltoKg) === aMilesimas(cuerpo.pesoDevuelto))) &&
    fila.productoEntregado.idProducto === cuerpo.idProductoEntregado &&
    aMilesimas(fila.productoEntregado.cantidad) === aMilesimas(cuerpo.cantidadEntregada) &&
    (fila.ventaVinculada?.idVenta ?? null) === (cuerpo.idVentaOriginal ?? null) &&
    convertirPesosACentavos(fila.saldoResultante) === envio.saldoEsperadoCentavos &&
    Date.parse(fila.fechaHora) >= envio.enviadoEnMilisegundos - MARGEN_VERIFICACION_MILISEGUNDOS
  )
}

/** Indica si el detalle de un candidato lo cargo este usuario con este motivo (lo que la lista no muestra). */
export function coincideDetalleConEnvio(cambio: CambioMercaderiaDetalle, envio: EnvioAltaCambio) {
  return (
    cambio.vendedor.idUsuario === envio.idUsuario && cambio.motivoCambio === envio.cuerpo.motivoCambio.trim()
  )
}
