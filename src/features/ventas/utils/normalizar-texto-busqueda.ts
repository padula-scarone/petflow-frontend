/**
 * Deja un texto listo para comparar en la busqueda del catalogo: sin mayusculas, sin tildes y sin espacios
 * en los extremos. El back no normaliza tildes; filtrar en el dispositivo permite encontrar "Piedras sanitarias"
 * escribiendo "sanitárias" o "SANITARIAS".
 */
export function normalizarTextoBusqueda(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}
