import {
  DNI_DIGITOS_MAXIMOS,
  DNI_DIGITOS_MINIMOS,
  NOMBRE_DEUDOR_LONGITUD_MAXIMA,
  NOMBRE_DEUDOR_LONGITUD_MINIMA,
  PREFIJO_TELEFONO,
  TELEFONO_DIGITOS,
} from '@/features/ventas/deudores/config/reglas-deudores'
import type { CampoDeudor, DatosDeudor, ErroresDatosDeudor } from '@/features/ventas/deudores/types/deudor'

// Los mensajes nunca repiten lo que escribio la persona: el DNI y el telefono no viajan en mensajes (RNF-VENTAS-03).

/** Solo digitos, espacios y guiones: el codigo de pais lo agrega el sistema, no quien escribe. */
const FORMATO_TELEFONO = /^[\d\s-]+$/
const FORMATO_DNI = /^\d+$/
/** Un telefono ya guardado: codigo de pais y 10 digitos. */
const FORMATO_TELEFONO_GUARDADO = new RegExp(`^${PREFIJO_TELEFONO}(\\d{${TELEFONO_DIGITOS}})$`)

/** Cuenta los digitos de un texto, sin contar "+", espacios ni guiones. */
export function contarDigitos(texto: string) {
  return texto.replace(/\D/g, '').length
}

/**
 * Valida un campo del deudor; devuelve el mensaje de error o undefined si es valido.
 * @param telefonoConservado Un telefono ya guardado con otro formato (no 549 y 10 digitos): si no se toca, se acepta
 * tal cual para no perderlo al editar los otros datos.
 */
export function validarCampoDeudor(
  campo: CampoDeudor,
  valor: string,
  telefonoConservado: string | null = null,
): string | undefined {
  const texto = valor.trim()

  if (campo === 'nombreCompleto') {
    if (texto.length < NOMBRE_DEUDOR_LONGITUD_MINIMA) return 'Ingresá el nombre y apellido'
    if (texto.length > NOMBRE_DEUDOR_LONGITUD_MAXIMA) {
      return `El nombre admite hasta ${NOMBRE_DEUDOR_LONGITUD_MAXIMA} caracteres`
    }
    return undefined
  }

  if (campo === 'telefono') {
    if (telefonoConservado !== null && texto === telefonoConservado) return undefined
    if (texto === '') return 'Ingresá el teléfono'
    if (!FORMATO_TELEFONO.test(texto)) return 'Usá solo números, espacios y guiones'
    // El 0 inicial es el del codigo de area: tambien se quita junto con el 15
    if (contarDigitos(texto) !== TELEFONO_DIGITOS || texto.replace(/\D/g, '').startsWith('0')) {
      return `Escribí ${TELEFONO_DIGITOS} números: código de área y número, sin 0 ni 15`
    }
    return undefined
  }

  if (texto === '') return 'Ingresá el DNI'
  if (!FORMATO_DNI.test(texto)) return 'Escribí solo números, sin puntos'
  if (texto.length < DNI_DIGITOS_MINIMOS || texto.length > DNI_DIGITOS_MAXIMOS) {
    return `Debe tener ${DNI_DIGITOS_MINIMOS} u ${DNI_DIGITOS_MAXIMOS} números`
  }
  return undefined
}

/** Valida todos los campos; devuelve un objeto vacio si no hay errores. */
export function validarDatosDeudor(datos: DatosDeudor, telefonoConservado: string | null = null): ErroresDatosDeudor {
  const campos: CampoDeudor[] = ['nombreCompleto', 'telefono', 'dni']
  return campos.reduce<ErroresDatosDeudor>((errores, campo) => {
    const mensaje = validarCampoDeudor(campo, datos[campo], telefonoConservado)
    return mensaje === undefined ? errores : { ...errores, [campo]: mensaje }
  }, {})
}

/**
 * Lo que se envia al back: sin espacios en los bordes y el telefono solo con digitos y con el 549 por delante
 * (10 digitos escritos + 549 = 13, dentro de los 11 a 15 que acepta el back). Un telefono conservado sin tocar viaja
 * como estaba guardado, sin agregarle nada.
 */
export function normalizarDatosDeudor(datos: DatosDeudor, telefonoConservado: string | null = null): DatosDeudor {
  const digitos = datos.telefono.replace(/\D/g, '')
  const sinTocar = telefonoConservado !== null && datos.telefono.trim() === telefonoConservado
  return {
    nombreCompleto: datos.nombreCompleto.trim(),
    telefono: sinTocar ? digitos : `${PREFIJO_TELEFONO}${digitos}`,
    dni: datos.dni.trim(),
  }
}

/**
 * El telefono que hay que conservar al editar: el de un deudor guardado con un formato que el formulario no sabe
 * escribir (no es 549 y 10 digitos). Con el formato normal o vacio no hay nada que conservar.
 */
export function obtenerTelefonoConservado(telefonoInicial: string) {
  const texto = telefonoInicial.trim()
  return texto === '' || texto.replace(/\D/g, '').length === TELEFONO_DIGITOS ? null : texto
}

/** El telefono para mostrar: sin el 549 si lo trae; uno guardado con otro formato se muestra completo, con "+". */
export function formatearTelefonoDeudor(telefono: string) {
  const local = obtenerTelefonoLocal(telefono)
  return local === telefono ? `+${telefono}` : local
}

/** El telefono como lo escribe y lo lee una persona: sin el 549 si lo trae. Un telefono sin ese formato queda igual. */
export function obtenerTelefonoLocal(telefono: string) {
  return FORMATO_TELEFONO_GUARDADO.exec(telefono)?.[1] ?? telefono
}
