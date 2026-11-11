/** Guarda de tipo para valores de origen externo (JSON, almacenamiento, history.state) antes de leer sus campos. */
export function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}
