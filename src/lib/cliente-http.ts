import { esObjeto } from '@/lib/es-objeto'
import type {
  ClienteHttp,
  ConfiguracionClienteHttp,
  ErrorApi,
  ErrorCampoApi,
  OpcionesSolicitud,
  ResultadoApi,
} from '@/lib/cliente-http.types'

// --- CONSTANTES ---
// Sin limite, un back que no responde dejaria la peticion colgada. 30 s alcanza porque el cron del
// SSOT mantiene despierto el back en Render; si igual estaba dormido, el reintento ya lo encuentra activo.
const TIEMPO_LIMITE_POR_DEFECTO_MS = 30_000
const ESTADO_NO_AUTORIZADO = 401

// --- FUNCIONES AUXILIARES ---
function esErrorCampo(valor: unknown): valor is ErrorCampoApi {
  return esObjeto(valor) && typeof valor.campo === 'string' && typeof valor.mensaje === 'string'
}

/** Extrae `errores[]` de un 400; ignora lo que no tenga la forma { campo, mensaje }. */
function leerErroresCampos(cuerpo: unknown): ErrorCampoApi[] {
  return esObjeto(cuerpo) && Array.isArray(cuerpo.errores) ? cuerpo.errores.filter(esErrorCampo) : []
}

function construirUrl(urlBase: string, ruta: string, parametros?: Record<string, string>): string {
  const consulta = parametros === undefined ? '' : `?${new URLSearchParams(parametros).toString()}`
  return `${urlBase}${ruta}${consulta}`
}

function crearFallo(error: ErrorApi): { exitoso: false; error: ErrorApi } {
  return { exitoso: false, error }
}

/** Distingue "no es JSON" (por ejemplo el HTML de error de Express o de un proxy) de un cuerpo valido. */
function interpretarCuerpo(texto: string): { esJson: true; cuerpo: unknown } | { esJson: false } {
  try {
    return { esJson: true, cuerpo: JSON.parse(texto) as unknown }
  } catch {
    return { esJson: false }
  }
}

// --- CLIENTE ---
/**
 * Crea el cliente HTTP de la aplicacion. No conoce la sesion: la recibe por parametros
 * (`obtenerToken` y `alRechazarSesion`), asi /lib no depende de /features.
 */
export function crearClienteHttp(configuracion: ConfiguracionClienteHttp): ClienteHttp {
  const { urlBase, obtenerToken, alRechazarSesion } = configuracion
  const tiempoLimitePorDefectoMs =
    configuracion.tiempoLimitePorDefectoMs ?? TIEMPO_LIMITE_POR_DEFECTO_MS

  async function solicitar<Datos>(
    ruta: string,
    opciones: OpcionesSolicitud = {},
  ): Promise<ResultadoApi<Datos>> {
    const {
      metodo = 'GET',
      cuerpo,
      parametros,
      conSesion = true,
      tiempoLimiteMs = tiempoLimitePorDefectoMs,
    } = opciones

    // Se fija el token antes de enviar: si el back lo rechaza, se avisa cual fue
    const tokenUsado = conSesion ? obtenerToken() : null
    const url = construirUrl(urlBase, ruta, parametros)
    const controlador = new AbortController()
    const temporizador = setTimeout(() => controlador.abort(), tiempoLimiteMs)

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          Accept: 'application/json',
          ...(cuerpo !== undefined && { 'Content-Type': 'application/json' }),
          ...(tokenUsado !== null && { Authorization: `Bearer ${tokenUsado}` }),
        },
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
        signal: controlador.signal,
      })
      // El limite tambien cubre la lectura del cuerpo: abortar aqui salta al catch
      const interpretado = interpretarCuerpo(await respuesta.text())

      if (!interpretado.esJson) {
        return crearFallo({
          tipo: 'RESPUESTA_NO_JSON',
          estado: respuesta.status,
          mensaje: null,
          errores: [],
        })
      }

      if (respuesta.ok) {
        return { exitoso: true, datos: interpretado.cuerpo as Datos }
      }

      // Solo una peticion que llevaba token puede significar "sesion rechazada"
      if (respuesta.status === ESTADO_NO_AUTORIZADO && tokenUsado !== null) {
        alRechazarSesion(tokenUsado)
      }
      const mensaje =
        esObjeto(interpretado.cuerpo) && typeof interpretado.cuerpo.mensaje === 'string'
          ? interpretado.cuerpo.mensaje
          : null
      return crearFallo({
        tipo: 'RESPUESTA_DEL_SERVIDOR',
        estado: respuesta.status,
        mensaje,
        errores: leerErroresCampos(interpretado.cuerpo),
      })
    } catch (causa) {
      // El navegador no distingue un rechazo por CORS de una falta de red: el detalle solo va a la consola de desarrollo
      if (import.meta.env.DEV) console.warn('[cliente-http] peticion fallida', metodo, url, causa)
      return crearFallo({
        tipo: controlador.signal.aborted ? 'TIEMPO_AGOTADO' : 'SIN_RED',
        estado: null,
        mensaje: null,
        errores: [],
      })
    } finally {
      clearTimeout(temporizador)
    }
  }

  return { solicitar }
}
