/** Que fallo en una peticion. Los llamadores deciden el mensaje; nunca se muestra el detalle tecnico. */
export type TipoErrorApi =
  | 'RESPUESTA_DEL_SERVIDOR'
  | 'RESPUESTA_NO_JSON'
  | 'SIN_RED'
  | 'TIEMPO_AGOTADO'

/** Error de un campo, tal como lo informa el back en los 400. */
export interface ErrorCampoApi {
  campo: string
  mensaje: string
}

export interface ErrorApi {
  tipo: TipoErrorApi
  /** Estado HTTP; null si no hubo respuesta (SIN_RED, TIEMPO_AGOTADO). */
  estado: number | null
  /** `mensaje` del back cuando la respuesta fue JSON; null si no. */
  mensaje: string | null
  /**
   * `codigo` del back cuando la respuesta fue JSON y lo trae (hoy solo los errores de Cambios); null si no.
   * Un 401 o un 403 de autenticacion no lo traen.
   */
  codigo: string | null
  errores: ErrorCampoApi[]
}

/** Nunca rechaza: el llamador revisa `exitoso`. Sin throw ni clases. */
export type ResultadoApi<Datos> =
  | { exitoso: true; datos: Datos }
  | { exitoso: false; error: ErrorApi }

export interface OpcionesSolicitud {
  metodo?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** Se envia como JSON. */
  cuerpo?: unknown
  /** Query string. */
  parametros?: Record<string, string>
  /** true por defecto: agrega Authorization y trata el 401 como sesion rechazada. El login pasa false. */
  conSesion?: boolean
  tiempoLimiteMs?: number
}

export interface ClienteHttp {
  solicitar: <Datos>(ruta: string, opciones?: OpcionesSolicitud) => Promise<ResultadoApi<Datos>>
}

export interface ConfiguracionClienteHttp {
  urlBase: string
  /** Token de la sesion actual; null si no hay. Lo provee quien conoce la sesion, para que /lib no dependa de /features. */
  obtenerToken: () => string | null
  /** Recibe el token con el que se envio la peticion que el back rechazo con 401. */
  alRechazarSesion: (tokenUsado: string) => void
  tiempoLimitePorDefectoMs?: number
}
