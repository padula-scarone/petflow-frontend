/** Lo que se sabe de la Caja Diaria para mostrarla en pantalla. */
interface EstadoCaja {
  cajaAbierta: boolean
}

/**
 * Estado de la Caja Diaria. Por ahora esta simulado: el SSOT define la caja como "Abierta"
 * en forma perpetua hasta que exista el modulo Caja. Al integrarlo, solo cambia este hook.
 */
export function useEstadoCaja(): EstadoCaja {
  return { cajaAbierta: true }
}
