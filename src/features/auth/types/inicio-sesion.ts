/** Campos del formulario. Coinciden con `campo` de los errores 400 del back. */
export type CampoInicioSesion = 'username' | 'clave'

/** Un mensaje por campo invalido. Un campo sin clave no tiene error. */
export type ErroresCamposInicioSesion = Partial<Record<CampoInicioSesion, string>>

/**
 * Valores tal cual los tipea el usuario. Tienen la misma forma que el body de
 * POST /api/auth/login: el hook recorta `username` al enviar y nunca recorta `clave`.
 */
export interface CredencialesInicioSesion {
  username: string
  clave: string
}

/** Props de la vista "Iniciar Sesion" (Dumb Component). */
export interface IniciarSesionProps {
  credenciales: CredencialesInicioSesion
  claveVisible: boolean
  /** true mientras la peticion esta en curso: bloquea el doble tap y muestra la carga. */
  enviando: boolean
  /** 401 ("Credenciales invalidas"), error de red o error del servidor. null = sin error. */
  errorGeneral: string | null
  erroresCampos: ErroresCamposInicioSesion
  onCambiarUsername: (username: string) => void
  onCambiarClave: (clave: string) => void
  onAlternarVisibilidadClave: () => void
  onIniciarSesion: () => void
}
