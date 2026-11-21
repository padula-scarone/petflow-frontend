import { useEffect, useRef, useState, type RefObject } from 'react'

/** Cuanto hay que bajar (en px) para que la cabecera se oculte: evita que un roce la esconda. */
const UMBRAL_OCULTAR = 12
/** Cuanto hay que subir (en px) para que reaparezca: poco, para que se sienta inmediato. */
const UMBRAL_MOSTRAR = 8
/**
 * Tiempo (en ms) que se ignora el scroll despues de un cambio de visibilidad. La barra inferior sale del layout y
 * el area con scroll cambia de alto: si estaba al final, el navegador recorta su posicion contra el nuevo maximo y
 * eso se leeria como un gesto hacia arriba, que la volveria a mostrar y empezaria un parpadeo. Un poco mas que la
 * transicion de la barra (200 ms).
 */
const PAUSA_TRANSICION = 300

/** Lo que devuelve el hook de la cabecera y la barra inferior que se ocultan al bajar y reaparecen al subir. */
interface BarrasDesplazables {
  /** Asignar al elemento de la cabecera: se mide su alto y se la saca del foco cuando esta oculta. */
  cabeceraRef: RefObject<HTMLDivElement | null>
  visible: boolean
  /** Alto de la cabecera en px; 0 si no se muestra (escritorio). */
  altoCabecera: number
}

/**
 * Cabecera y barra inferior de mobile que se esconden al desplazarse hacia abajo y reaparecen apenas se sube un
 * poco, sin llegar hasta el principio. `visible` es una sola senal para las dos: se mueven juntas. Siempre es
 * visible cerca del principio del contenido.
 * @param contenidoRef Elemento con el scroll.
 */
export function useBarrasDesplazables(
  contenidoRef: RefObject<HTMLElement | null>,
): BarrasDesplazables {
  // --- ESTADOS ---
  const cabeceraRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [altoCabecera, setAltoCabecera] = useState(0)

  // --- ALTO DE LA CABECERA ---
  // Se observa en lugar de medirla una vez: cambia al rotar el celular o si cambian las pestañas
  useEffect(() => {
    const cabecera = cabeceraRef.current
    if (!cabecera) return
    const observador = new ResizeObserver(() => setAltoCabecera(cabecera.offsetHeight))
    observador.observe(cabecera)
    return () => observador.disconnect()
  }, [])

  // --- DIRECCION DEL DESPLAZAMIENTO ---
  useEffect(() => {
    const contenido = contenidoRef.current
    if (!contenido) return

    // Variables locales del oyente (no son estado de React): posicion anterior y lo desplazado
    // de corrido en la misma direccion; un cambio de sentido reinicia la cuenta
    let posicionAnterior = contenido.scrollTop
    let desplazadoEnLaDireccion = 0
    let visibleActual = true
    let ignorarHasta = 0

    // Solo avisa a React si cambia; y al cambiar abre una pausa (ver PAUSA_TRANSICION)
    const cambiarVisibilidad = (nuevaVisibilidad: boolean) => {
      if (nuevaVisibilidad === visibleActual) return
      visibleActual = nuevaVisibilidad
      desplazadoEnLaDireccion = 0
      ignorarHasta = performance.now() + PAUSA_TRANSICION
      setVisible(nuevaVisibilidad)
    }

    const alDesplazar = () => {
      const posicionActual = contenido.scrollTop
      const variacion = posicionActual - posicionAnterior
      posicionAnterior = posicionActual

      // Durante la pausa el scroll puede moverse solo por el cambio de alto del area: no es un gesto del usuario
      if (performance.now() < ignorarHasta) return

      // Cerca del principio la cabecera esta en su lugar natural: siempre visible
      if (posicionActual <= (cabeceraRef.current?.offsetHeight ?? 0)) {
        desplazadoEnLaDireccion = 0
        cambiarVisibilidad(true)
        return
      }

      desplazadoEnLaDireccion =
        Math.sign(variacion) === Math.sign(desplazadoEnLaDireccion)
          ? desplazadoEnLaDireccion + variacion
          : variacion
      if (desplazadoEnLaDireccion > UMBRAL_OCULTAR) cambiarVisibilidad(false)
      else if (desplazadoEnLaDireccion < -UMBRAL_MOSTRAR) cambiarVisibilidad(true)
    }

    contenido.addEventListener('scroll', alDesplazar, { passive: true })
    return () => contenido.removeEventListener('scroll', alDesplazar)
  }, [contenidoRef])

  return { cabeceraRef, visible, altoCabecera }
}
