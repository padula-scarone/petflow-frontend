import type { ClienteHttp } from '@/lib/cliente-http.types'
import { consultarDevolucionApi } from '@/features/ventas/devoluciones/api/consultar-devolucion-api'
import { consultarDevolucionesApi } from '@/features/ventas/devoluciones/api/consultar-devoluciones-api'
import type {
  DevolucionDetalle,
  FiltrosDevoluciones,
} from '@/features/ventas/devoluciones/types/devolucion'
import {
  coincideDetalleConEnvio,
  coincideFilaConEnvio,
  formatearFechaArgentina,
  type EnvioAltaDevolucion,
} from '@/features/ventas/devoluciones/utils/verificar-resultado-devolucion'

/** Maximo que admite el back por pagina: una sola pagina alcanza para las devoluciones de un dia de un producto. */
const CANTIDAD_POR_PAGINA_VERIFICACION = 100

/** Que se pudo saber sobre un alta de resultado incierto. */
export type VerificacionAlta =
  /** Hay una devolución de este usuario, con este motivo y estos datos, cargado despues del envio: se guardo. */
  | { tipo: 'guardado'; devolucion: DevolucionDetalle }
  /** La lista se leyo completa y no hay ninguna: no se guardo, se puede volver a confirmar. */
  | { tipo: 'no-guardado' }
  /** No se pudo consultar, o hay mas resultados de los que se leyeron: no se puede afirmar nada. */
  | { tipo: 'indeterminado' }

/**
 * El back no tiene clave de idempotencia: reenviar un alta incierta a ciegas puede duplicar la devolución. Para
 * saber si se guardo se consulta la lista de los dias del envio filtrada por el producto devuelto, se comparan
 * productos, cantidades, peso, venta, saldo y hora, y de los candidatos se pide el detalle para confirmar el
 * vendedor y el motivo (la lista no los trae).
 * @param ahoraServidorMilisegundos Hora del servidor estimada ahora, para incluir el dia actual si cambio la fecha.
 */
export async function verificarAltaGuardada(
  cliente: ClienteHttp,
  envio: EnvioAltaDevolucion,
  ahoraServidorMilisegundos: number,
): Promise<VerificacionAlta> {
  const filtros: FiltrosDevoluciones = {
    fechaDesde: formatearFechaArgentina(envio.enviadoEnMilisegundos),
    fechaHasta: formatearFechaArgentina(Math.max(ahoraServidorMilisegundos, envio.enviadoEnMilisegundos)),
    productoSeleccionado: { idProducto: envio.cuerpo.idProductoDevuelto, nombreProducto: '' },
    estado: null,
    vinculo: null,
    medioPago: null,
  }
  const lista = await consultarDevolucionesApi(cliente, filtros, 1, CANTIDAD_POR_PAGINA_VERIFICACION)
  if (!lista.exitoso) return { tipo: 'indeterminado' }

  for (const fila of lista.datos.devoluciones.filter((candidata) => coincideFilaConEnvio(candidata, envio))) {
    const detalle = await consultarDevolucionApi(cliente, fila.idDevolucion)
    if (!detalle.exitoso) return { tipo: 'indeterminado' }
    if (coincideDetalleConEnvio(detalle.datos.devolucion, envio)) return { tipo: 'guardado', devolucion: detalle.datos.devolucion }
  }
  // Con mas de una pagina la devolución podria estar en una que no se leyo
  return lista.datos.paginacion.totalPaginas > 1 ? { tipo: 'indeterminado' } : { tipo: 'no-guardado' }
}
