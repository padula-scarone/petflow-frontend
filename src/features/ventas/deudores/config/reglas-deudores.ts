// Reglas de formato de los datos de un deudor (las valida tambien el back, en datosDeudorSchema). El telefono se
// escribe con 10 digitos (codigo de area y numero, sin 0 ni 15) y al enviarlo se le antepone el 549: el back guarda
// de 11 a 15 digitos con codigo de pais, y con el 549 quedan 13.

/** Largo minimo y maximo del nombre y apellido. */
export const NOMBRE_DEUDOR_LONGITUD_MINIMA = 1
export const NOMBRE_DEUDOR_LONGITUD_MAXIMA = 100

/** Cantidad de digitos que escribe quien carga el telefono: codigo de area y numero, sin espacios ni guiones. */
export const TELEFONO_DIGITOS = 10

/** Lo que se antepone al telefono al enviarlo: codigo de Argentina (54) y el 9 de los celulares. */
export const PREFIJO_TELEFONO = '549'

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
