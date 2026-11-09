import { esObjeto } from '@/lib/es-objeto'
import type { UsuarioSesion } from '@/features/auth/types/api-auth'
import type { Sesion } from '@/features/auth/types/sesion'

/** Clave con la que la sesion se guarda en localStorage. */
export const CLAVE_ALMACENAMIENTO_SESION = 'petflow.sesion'

const ROLES_VALIDOS: readonly unknown[] = ['VENDEDOR', 'GESTOR_COMERCIAL', 'GERENTE']

/** Resultado de leer la sesion guardada al arrancar. `vencida` distingue "no habia" de "habia, pero vencio". */
export interface LecturaSesionGuardada {
  sesion: Sesion | null
  vencida: boolean
}

// --- VALIDACION ---
// Lo guardado es un dato no confiable (otra version de la app, edicion manual): se valida su forma.
function esUsuarioSesion(valor: unknown): valor is UsuarioSesion {
  return (
    esObjeto(valor) &&
    typeof valor.idUsuario === 'number' &&
    typeof valor.username === 'string' &&
    typeof valor.nombre === 'string' &&
    ROLES_VALIDOS.includes(valor.rol)
  )
}

export function esSesion(valor: unknown): valor is Sesion {
  return (
    esObjeto(valor) &&
    typeof valor.token === 'string' &&
    valor.token !== '' &&
    typeof valor.vencimiento === 'number' &&
    Number.isFinite(valor.vencimiento) &&
    esUsuarioSesion(valor.usuario)
  )
}

// --- ACCESO AL ALMACENAMIENTO ---
// Cada acceso va en try/catch: el almacenamiento puede estar bloqueado (modo privado, politicas).
// Sin el, la sesion vive solo en memoria y se pierde al recargar.
export function guardarSesion(sesion: Sesion): void {
  try {
    localStorage.setItem(CLAVE_ALMACENAMIENTO_SESION, JSON.stringify(sesion))
  } catch {
    // Sin almacenamiento: la sesion sigue en memoria
  }
}

export function borrarSesionGuardada(): void {
  try {
    localStorage.removeItem(CLAVE_ALMACENAMIENTO_SESION)
  } catch {
    // Sin almacenamiento: no hay nada que borrar
  }
}

/**
 * Lee la sesion guardada. Si tiene forma invalida o ya vencio, la descarta del almacenamiento.
 * @param ahora Instante actual en milisegundos (se recibe para no leer el reloj dentro de la funcion).
 */
export function leerSesionGuardada(ahora: number): LecturaSesionGuardada {
  try {
    const textoGuardado = localStorage.getItem(CLAVE_ALMACENAMIENTO_SESION)
    if (textoGuardado === null) return { sesion: null, vencida: false }

    const contenido: unknown = JSON.parse(textoGuardado)
    if (!esSesion(contenido)) {
      borrarSesionGuardada()
      return { sesion: null, vencida: false }
    }
    if (contenido.vencimiento <= ahora) {
      borrarSesionGuardada()
      return { sesion: null, vencida: true }
    }
    return { sesion: contenido, vencida: false }
  } catch {
    // JSON corrupto o almacenamiento inaccesible
    borrarSesionGuardada()
    return { sesion: null, vencida: false }
  }
}
