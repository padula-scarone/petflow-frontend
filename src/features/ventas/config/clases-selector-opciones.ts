// Estilo unico de los selectores de opciones (Canal, Entrega, Unico / Mixto, Forma de pago). Todos usan estas dos
// clases, asi el ancho y el padding son iguales en cada pantalla y en cada tamano. El selector siempre tiene su propia
// fila, con el titulo arriba: nunca comparte fila con otro control.

/** Contenedor: ocupa todo el ancho de la tarjeta. */
export const CLASE_GRUPO_SELECTOR = 'w-full rounded-grande border border-borde-campo bg-fondo-tarjeta'

/** Cada opcion: reparten el ancho en partes iguales y llevan el mismo padding en todos los tamanos. */
export const CLASE_OPCION_SELECTOR = 'flex-1 px-4'
