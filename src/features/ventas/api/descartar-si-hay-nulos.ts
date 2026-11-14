/** Devuelve la lista sin nulos, o null si alguno de sus elementos no se pudo convertir. */
export function descartarSiHayNulos<Elemento>(lista: (Elemento | null)[]): Elemento[] | null {
  const sinNulos = lista.filter((elemento): elemento is Elemento => elemento !== null)
  return sinNulos.length === lista.length ? sinNulos : null
}
