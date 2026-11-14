import type { ClienteHttp } from '@/lib/cliente-http.types'
import { consultarCambioApi } from '@/features/ventas/cambios-mercaderia/api/consultar-cambio-api'
import { consultarCambiosApi } from '@/features/ventas/cambios-mercaderia/api/consultar-cambios-api'
import type {
  CambioMercaderiaDetalle,
  FiltrosCambios,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import {
  coincideDetalleConEnvio,
  coincideFilaConEnvio,
  formatearFechaArgentina,
  type EnvioAltaCambio,
} from '@/features/ventas/cambios-mercaderia/utils/verificar-resultado-cambio'

/** Maximo que admite el back por pagina: una sola pagina alcanza para los cambios de un dia de un producto. */
const CANTIDAD_POR_PAGINA_VERIFICACION = 100

/** Que se pudo saber sobre un alta de resultado incierto. */
export type VerificacionAlta =
  /** Hay un cambio de este usuario, con este motivo y estos datos, cargado despues del envio: se guardo. */
  | { tipo: 'guardado'; cambio: CambioMercaderiaDetalle }
  /** La lista se leyo completa y no hay ninguno: no se guardo, se puede volver a confirmar. */
  | { tipo: 'no-guardado' }
  /** No se pudo consultar, o hay mas resultados de los que se leyeron: no se puede afirmar nada. */
  | { tipo: 'indeterminado' }

/**
 * El back no tiene clave de idempotencia: reenviar un alta incierta a ciegas puede duplicar el cambio. Para
 * saber si se guardo se consulta la lista de los dias del envio filtrada por el producto devuelto, se comparan
 * productos, cantidades, peso, venta, saldo y hora, y de los candidatos se pide el detalle para confirmar el
 * vendedor y el motivo (la lista no los trae).
 * @param ahoraServidorMilisegundos Hora del servidor estimada ahora, para incluir el dia actual si cambio la fecha.
 */
export async function verificarAltaGuardada(
  cliente: ClienteHttp,
  envio: EnvioAltaCambio,
  ahoraServidorMilisegundos: number,
): Promise<VerificacionAlta> {
  const filtros: FiltrosCambios = {
    fechaDesde: formatearFechaArgentina(envio.enviadoEnMilisegundos),
    fechaHasta: formatearFechaArgentina(Math.max(ahoraServidorMilisegundos, envio.enviadoEnMilisegundos)),
    productoSeleccionado: { idProducto: envio.cuerpo.idProductoDevuelto, nombreProducto: '' },
    estado: null,
    vinculo: null,
    medioPago: null,
  }
  const lista = await consultarCambiosApi(cliente, filtros, 1, CANTIDAD_POR_PAGINA_VERIFICACION)
  if (!lista.exitoso) return { tipo: 'indeterminado' }

  for (const fila of lista.datos.cambios.filter((candidata) => coincideFilaConEnvio(candidata, envio))) {
    const detalle = await consultarCambioApi(cliente, fila.idCambio)
    if (!detalle.exitoso) return { tipo: 'indeterminado' }
    if (coincideDetalleConEnvio(detalle.datos.cambio, envio)) return { tipo: 'guardado', cambio: detalle.datos.cambio }
  }
  // Con mas de una pagina el cambio podria estar en una que no se leyo
  return lista.datos.paginacion.totalPaginas > 1 ? { tipo: 'indeterminado' } : { tipo: 'no-guardado' }
}
