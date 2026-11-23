import {
  DNI_DIGITOS_MAXIMOS,
  DNI_DIGITOS_MINIMOS,
  NOMBRE_DEUDOR_LONGITUD_MAXIMA,
  NOMBRE_DEUDOR_LONGITUD_MINIMA,
  TELEFONO_DIGITOS_MAXIMOS,
  TELEFONO_DIGITOS_MINIMOS,
} from '@/features/ventas/deudores/config/reglas-deudores'
import type { CampoDeudor, DatosDeudor, ErroresDatosDeudor } from '@/features/ventas/deudores/types/deudor'

// Los mensajes nunca repiten lo que escribio la persona: el DNI y el telefono no viajan en mensajes (RNF-VENTAS-03).

/** Solo digitos, espacios, guiones y un "+" al inicio. */
const FORMATO_TELEFONO = /^\+?[\d\s-]+$/
const FORMATO_DNI = /^\d+$/

/** Cuenta los digitos de un texto, sin contar "+", espacios ni guiones. */
export function contarDigitos(texto: string) {
  return texto.replace(/\D/g, '').length
}

/** Valida un campo del deudor; devuelve el mensaje de error o undefined si es valido. */
export function validarCampoDeudor(campo: CampoDeudor, valor: string): string | undefined {
  const texto = valor.trim()

  if (campo === 'nombreCompleto') {
    if (texto.length < NOMBRE_DEUDOR_LONGITUD_MINIMA) return 'Ingresá el nombre y apellido'
    if (texto.length > NOMBRE_DEUDOR_LONGITUD_MAXIMA) {
      return `El nombre admite hasta ${NOMBRE_DEUDOR_LONGITUD_MAXIMA} caracteres`
    }
    return undefined
  }

  if (campo === 'telefono') {
    if (texto === '') return 'Ingresá el teléfono'
    if (!FORMATO_TELEFONO.test(texto)) return 'Usá solo números, espacios, guiones y un + al inicio'
    const digitos = contarDigitos(texto)
    if (digitos < TELEFONO_DIGITOS_MINIMOS || digitos > TELEFONO_DIGITOS_MAXIMOS) {
      return `Debe tener entre ${TELEFONO_DIGITOS_MINIMOS} y ${TELEFONO_DIGITOS_MAXIMOS} dígitos`
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
export function validarDatosDeudor(datos: DatosDeudor): ErroresDatosDeudor {
  const campos: CampoDeudor[] = ['nombreCompleto', 'telefono', 'dni']
  return campos.reduce<ErroresDatosDeudor>((errores, campo) => {
    const mensaje = validarCampoDeudor(campo, datos[campo])
    return mensaje === undefined ? errores : { ...errores, [campo]: mensaje }
  }, {})
}

/** Quita los espacios de los bordes: es lo que se envia al back. */
export function normalizarDatosDeudor(datos: DatosDeudor): DatosDeudor {
  return {
    nombreCompleto: datos.nombreCompleto.trim(),
    telefono: datos.telefono.trim(),
    dni: datos.dni.trim(),
  }
}
