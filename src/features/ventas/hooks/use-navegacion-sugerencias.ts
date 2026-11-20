import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

/** Lo que necesita la navegacion con teclado de una lista de sugerencias. */
interface OpcionesNavegacionSugerencias {
  /** Id de la lista; de el salen los ids de sus opciones. */
  idLista: string
  /** true mientras la lista se muestra (aunque no tenga opciones). */
  listaVisible: boolean
  /** Una entrada por opcion, en orden: false si no se puede elegir (por ejemplo, un producto sin stock). */
  opcionesHabilitadas: boolean[]
  /** Se llama con la posicion de la opcion resaltada al apretar Enter. */
  alElegir: (indiceOpcion: number) => void
}

function crearIdOpcion(idLista: string, indiceOpcion: number) {
  return `${idLista}-opcion-${indiceOpcion}`
}

/**
 * Proxima opcion habilitada en el sentido dado, dando la vuelta al llegar al extremo; null si no hay ninguna.
 * @param indiceActivo Opcion resaltada ahora; null si no hay ninguna: abajo empieza por la primera y arriba por la ultima.
 * @param sentido 1 baja, -1 sube.
 */
export function buscarOpcionHabilitada(
  opcionesHabilitadas: boolean[],
  indiceActivo: number | null,
  sentido: 1 | -1,
): number | null {
  const cantidad = opcionesHabilitadas.length
  const inicio = indiceActivo ?? (sentido === 1 ? -1 : cantidad)
  for (let paso = 1; paso <= cantidad; paso++) {
    // El doble modulo evita indices negativos al subir desde la primera
    const candidato = (((inicio + sentido * paso) % cantidad) + cantidad) % cantidad
    if (opcionesHabilitadas[candidato]) return candidato
  }
  return null
}

/**
 * Navegacion con las flechas por una lista de sugerencias, como en Google o YouTube: el foco se queda en el
 * campo (se puede seguir escribiendo), la flecha de abajo baja y la de arriba sube, y al pasar el ultimo
 * se vuelve al primero y viceversa. Enter elige la opcion resaltada. Las opciones deshabilitadas se saltean.
 * Devuelve las propiedades ARIA y los eventos que se reparten entre el campo, la lista y cada opcion.
 */
export function useNavegacionSugerencias({
  idLista,
  listaVisible,
  opcionesHabilitadas,
  alElegir,
}: OpcionesNavegacionSugerencias) {
  // --- ESTADOS ---
  const [indiceGuardado, setIndiceGuardado] = useState<number | null>(null)
  // Para desplazar la lista solo cuando la opcion cambia por teclado: con el mouse ya esta a la vista
  const movidoPorTecladoRef = useRef(false)

  // Sin opciones (la lista se cerro o se vacio) no queda nada resaltado: asi, al reabrirse, no arranca a mitad
  if (opcionesHabilitadas.length === 0 && indiceGuardado !== null) setIndiceGuardado(null)
  // Un indice que ya no existe o ya no se puede elegir (la lista cambio) no cuenta como resaltado
  const indiceActivo =
    indiceGuardado !== null && opcionesHabilitadas[indiceGuardado] === true ? indiceGuardado : null

  // --- DESPLAZAMIENTO ---
  useEffect(() => {
    if (indiceActivo === null || !movidoPorTecladoRef.current) return
    movidoPorTecladoRef.current = false
    document.getElementById(crearIdOpcion(idLista, indiceActivo))?.scrollIntoView({ block: 'nearest' })
  }, [indiceActivo, idLista])

  // --- NAVEGACION ---
  const manejarTeclado = (evento: KeyboardEvent<HTMLInputElement>) => {
    if (opcionesHabilitadas.length === 0) return
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      // Sin esto la flecha tambien mueve el cursor al inicio o al final del texto
      evento.preventDefault()
      movidoPorTecladoRef.current = true
      setIndiceGuardado(
        buscarOpcionHabilitada(opcionesHabilitadas, indiceActivo, evento.key === 'ArrowDown' ? 1 : -1),
      )
    } else if (evento.key === 'Enter' && indiceActivo !== null) {
      evento.preventDefault()
      alElegir(indiceActivo)
    }
  }

  return {
    /** Quita el resaltado: al cambiar el texto o al salir del buscador. */
    reiniciar: () => setIndiceGuardado(null),
    propiedadesCampo: {
      role: 'combobox' as const,
      'aria-expanded': listaVisible,
      'aria-controls': listaVisible ? idLista : undefined,
      'aria-autocomplete': 'list' as const,
      'aria-activedescendant':
        indiceActivo === null ? undefined : crearIdOpcion(idLista, indiceActivo),
      onKeyDown: manejarTeclado,
    },
    propiedadesLista: { id: idLista, role: 'listbox' as const },
    /** Las opciones no se alcanzan con Tab: se recorren con las flechas, con el foco en el campo. */
    propiedadesOpcion: (indiceOpcion: number) => ({
      id: crearIdOpcion(idLista, indiceOpcion),
      role: 'option' as const,
      'aria-selected': indiceOpcion === indiceActivo,
      tabIndex: -1,
      // El mouse resalta la opcion sobre la que se mueve, asi hay un solo resaltado a la vez
      onMouseMove: () => {
        movidoPorTecladoRef.current = false
        if (opcionesHabilitadas[indiceOpcion]) setIndiceGuardado(indiceOpcion)
      },
    }),
  }
}
