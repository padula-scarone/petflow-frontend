/// <reference types="vite/client" />

/** Variables de entorno que usa la aplicacion (ver .env.example). */
interface ImportMetaEnv {
  /** URL base de la API del back, sin barra final. */
  readonly VITE_URL_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
