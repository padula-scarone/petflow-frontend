import { LATENCIA_SIMULADA_MILISEGUNDOS } from '@/features/ventas/deudores/config/reglas-deudores'

/** Espera como lo haria una respuesta del back, para que los estados de carga se vean en la maqueta. */
export function simularLatencia(milisegundos: number = LATENCIA_SIMULADA_MILISEGUNDOS) {
  return new Promise<void>((resolver) => {
    setTimeout(resolver, milisegundos)
  })
}
