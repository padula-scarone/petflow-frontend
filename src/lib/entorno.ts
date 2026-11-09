const urlApiConfigurada = import.meta.env.VITE_URL_API

// Falla al arrancar en lugar de apuntar a una URL por defecto: un valor oculto podria mandar
// los datos de produccion a localhost, o los de desarrollo a produccion.
if (!urlApiConfigurada) {
  throw new Error('Falta la variable de entorno VITE_URL_API (ver .env.example)')
}

/** URL base de la API del back, sin barra final. */
export const URL_API = urlApiConfigurada.replace(/\/+$/, '')
