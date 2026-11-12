import { useEffect, useState } from 'react'

/**
 * Reloj de la ventana de 15 minutos: devuelve la hora del servidor en milisegundos y la actualiza
 * justo cuando vence la proxima ventana, para que la fila pierda sus acciones sin recargar.
 * No cuenta segundo a segundo: no hay contador a la vista, solo la hora de vencimiento.
 * El desfase corrige el reloj del dispositivo: en la integracion sale de comparar
 * `fechaHoraServidor` de la respuesta con la hora local; la maqueta lo recibe fijo.
 */
export function usePlazoModificacionVenta(
  fechasLimite: ReadonlyArray<string | null>,
  desfaseServidorMilisegundos: number,
) {
  // --- ESTADOS ---
  const [ahoraLocalMilisegundos, setAhoraLocalMilisegundos] = useState(() => Date.now())

  // --- CALCULOS ---
  const ahoraServidorMilisegundos = ahoraLocalMilisegundos + desfaseServidorMilisegundos
  // Proximo instante en que alguna ventana vence; null si ya no queda ninguna vigente
  const proximoVencimiento = fechasLimite.reduce<number | null>((menor, fechaLimite) => {
    if (fechaLimite === null) return menor
    const vencimiento = Date.parse(fechaLimite)
    if (vencimiento <= ahoraServidorMilisegundos) return menor
    return menor === null || vencimiento < menor ? vencimiento : menor
  }, null)

  // --- EFECTOS ---
  // Un temporizador por vencimiento: al dispararse se recalcula y se programa el siguiente
  useEffect(() => {
    if (proximoVencimiento === null) return
    const actualizar = () => setAhoraLocalMilisegundos(Date.now())
    // Un margen chico asegura que, al despertar, el vencimiento ya quedo atras
    const espera = Math.max(0, proximoVencimiento - Date.now() - desfaseServidorMilisegundos) + 100
    const temporizador = setTimeout(actualizar, espera)
    // Con la pantalla apagada el navegador demora los temporizadores: se revisa al volver
    document.addEventListener('visibilitychange', actualizar)
    return () => {
      clearTimeout(temporizador)
      document.removeEventListener('visibilitychange', actualizar)
    }
  }, [proximoVencimiento, desfaseServidorMilisegundos])

  return ahoraServidorMilisegundos
}
