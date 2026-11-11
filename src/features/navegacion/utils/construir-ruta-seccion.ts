/** Arma la ruta absoluta de una seccion a partir de los ids del menu (ej. /ventas/historial). */
export function construirRutaSeccion(idModulo: string, idSeccion: string): string {
  return `/${idModulo}/${idSeccion}`
}
