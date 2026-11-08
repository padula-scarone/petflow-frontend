import type { NonIndexRouteObject } from 'react-router'

/**
 * Ruta que una feature registra para una seccion del menu. El router la ubica bajo
 * /<idModulo>/<idSeccion>, por eso `ruta` no lleva `path` propio.
 * `ruta.handle` queda libre para declarar mas adelante los roles permitidos de la seccion.
 */
export interface RutaSeccion {
  idModulo: string
  idSeccion: string
  ruta: Omit<NonIndexRouteObject, 'path' | 'index'>
}
