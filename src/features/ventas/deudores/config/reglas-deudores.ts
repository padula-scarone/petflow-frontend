// Reglas de formato de los datos de un deudor. El nombre y el DNI son los que valida el back (datosDeudorSchema).
// El telefono no: el back hoy exige entre 11 y 15 digitos (codigo de pais incluido) y la maqueta no se lo pide a quien
// lo escribe. Hasta que el back lo acepte sin codigo de pais, un telefono corto lo rechazaria con 400.

/** Largo minimo y maximo del nombre y apellido. */
export const NOMBRE_DEUDOR_LONGITUD_MINIMA = 1
export const NOMBRE_DEUDOR_LONGITUD_MAXIMA = 100

/** Cantidad de digitos del telefono, con o sin codigo de pais, sin contar el "+", los espacios ni los guiones. */
export const TELEFONO_DIGITOS_MINIMOS = 8
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
