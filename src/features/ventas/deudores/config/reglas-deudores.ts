// Reglas de formato de los datos de un deudor. Son las mismas que valida el back (datosDeudorSchema).

/** Largo minimo y maximo del nombre y apellido. */
export const NOMBRE_DEUDOR_LONGITUD_MINIMA = 1
export const NOMBRE_DEUDOR_LONGITUD_MAXIMA = 100

/** Cantidad de digitos del telefono con codigo de pais, sin contar el "+", los espacios ni los guiones. */
export const TELEFONO_DIGITOS_MINIMOS = 11
export const TELEFONO_DIGITOS_MAXIMOS = 15

/** El DNI tiene 7 u 8 digitos, sin puntos. */
export const DNI_DIGITOS_MINIMOS = 7
export const DNI_DIGITOS_MAXIMOS = 8

/** Cuantos deudores trae cada pagina de la lista. */
export const DEUDORES_POR_PAGINA = 10

/** Cuantas sugerencias muestra el buscador de deudor de Registrar Venta. */
export const SUGERENCIAS_DEUDOR_MAXIMAS = 6

/** Cuanto espera el buscador antes de pedir resultados, para no pedir uno por cada tecla. */
export const ESPERA_BUSQUEDA_MILISEGUNDOS = 300

/** Cuanto tarda una respuesta simulada del back. */
export const LATENCIA_SIMULADA_MILISEGUNDOS = 600
