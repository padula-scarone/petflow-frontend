import type { RegistroVenta } from '@/features/ventas/types/registro-venta'

/** Estado del envio de la venta al back; decide que muestra y que permite la pantalla de Cobro. */
export type EstadoEnvioVenta =
  | { fase: 'inactivo' }
  | {
      fase: 'enviando'
      /** Tiempo que lleva la peticion, para la barra de progreso. */
      segundosTranscurridos: number
    }
  /** El back respondio con un error de validacion o de regla: no se guardo nada y se puede corregir y reintentar. */
  | { fase: 'rechazado'; mensaje: string }
  /** Sin respuesta (tiempo agotado, sin red, respuesta ilegible): la venta pudo haberse guardado. No se reenvia. */
  | { fase: 'resultado-incierto'; mensaje: string }
  /** El back confirmo el alta (201): la venta ya existe y no se vuelve a enviar. */
  | { fase: 'registrada'; registro: RegistroVenta }

/** Como se traduce un error del alta de venta. */
export interface ErrorEnvioVenta {
  /** Texto para la vista; null cuando el cliente HTTP ya lo resolvio (401: cierra la sesion). */
  mensaje: string | null
  /** true si la venta pudo haberse guardado: no hay que invitar a reenviarla. */
  incierto: boolean
  /** true si el error sugiere que catalogo o medios cambiaron en el back. */
  recargarDatos: boolean
}
