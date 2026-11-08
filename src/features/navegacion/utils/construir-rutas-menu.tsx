import { redirect, type RouteObject } from 'react-router'
import { SeccionEnConstruccion } from '@/features/navegacion/components/seccion-en-construccion'
import type { ModuloMenu } from '@/features/navegacion/types/menu'
import type { RutaSeccion } from '@/features/navegacion/types/rutas'
import { construirRutaSeccion } from '@/features/navegacion/utils/construir-ruta-seccion'

/**
 * Deriva las rutas del menu sin duplicar sus ids.
 * - Modulo sin rutas de seccion declaradas: una sola ruta /<modulo> en construccion.
 * - Modulo con rutas declaradas: /<modulo> redirige a su primera seccion y cada seccion usa
 *   la ruta de su feature, o "en construccion" si todavia no tiene pantalla.
 */
export function construirRutasMenu(
  modulos: ModuloMenu[],
  rutasSecciones: RutaSeccion[],
): RouteObject[] {
  // Falla rapido si una feature declara una seccion que el menu no tiene
  rutasSecciones.forEach(({ idModulo, idSeccion }) => {
    const existe = modulos
      .find((modulo) => modulo.idModulo === idModulo)
      ?.secciones.some((seccion) => seccion.idSeccion === idSeccion)
    if (!existe) throw new Error(`La ruta ${idModulo}/${idSeccion} no existe en MODULOS_MENU`)
  })

  return modulos.map((modulo): RouteObject => {
    const rutasDelModulo = rutasSecciones.filter((ruta) => ruta.idModulo === modulo.idModulo)
    if (rutasDelModulo.length === 0) {
      return { path: modulo.idModulo, element: <SeccionEnConstruccion /> }
    }
    const primeraSeccion = modulo.secciones[0]
    return {
      path: modulo.idModulo,
      children: [
        {
          index: true,
          loader: () => redirect(construirRutaSeccion(modulo.idModulo, primeraSeccion.idSeccion)),
        },
        ...modulo.secciones.map((seccion): RouteObject => {
          const declarada = rutasDelModulo.find((ruta) => ruta.idSeccion === seccion.idSeccion)
          return {
            path: seccion.idSeccion,
            ...(declarada?.ruta ?? { element: <SeccionEnConstruccion /> }),
          }
        }),
      ],
    }
  })
}
