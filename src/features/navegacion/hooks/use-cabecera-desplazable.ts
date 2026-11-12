import { useEffect, useRef, useState, type RefObject } from 'react'

/** Cuanto hay que bajar (en px) para que la cabecera se oculte: evita que un roce la esconda. */
const UMBRAL_OCULTAR = 12
/** Cuanto hay que subir (en px) para que reaparezca: poco, para que se sienta inmediato. */
const UMBRAL_MOSTRAR = 8

/** Lo que devuelve el hook de la cabecera que se oculta al bajar y reaparece al subir. */
interface CabeceraDesplazable {
  /** Asignar al elemento de la cabecera: se mide su alto y se la saca del foco cuando esta oculta. */
  cabeceraRef: RefObject<HTMLDivElement | null>
  visible: boolean
  /** Alto de la cabecera en px; 0 si no se muestra (escritorio). */
  altoCabecera: number
}

/**
 * Cabecera de mobile que se esconde al desplazarse hacia abajo y reaparece apenas se sube un poco,
 * sin llegar hasta el principio. Siempre es visible cerca del principio del contenido.
 * @param contenidoRef Elemento con el scroll.
 */
export function useCabeceraDesplazable(
  contenidoRef: RefObject<HTMLElement | null>,
): CabeceraDesplazable {
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

    const alDesplazar = () => {
      const posicionActual = contenido.scrollTop
      const variacion = posicionActual - posicionAnterior
      posicionAnterior = posicionActual

      // Cerca del principio la cabecera esta en su lugar natural: siempre visible
      if (posicionActual <= (cabeceraRef.current?.offsetHeight ?? 0)) {
        desplazadoEnLaDireccion = 0
        setVisible(true)
        return
      }

      desplazadoEnLaDireccion =
        Math.sign(variacion) === Math.sign(desplazadoEnLaDireccion)
          ? desplazadoEnLaDireccion + variacion
          : variacion
      if (desplazadoEnLaDireccion > UMBRAL_OCULTAR) setVisible(false)
      else if (desplazadoEnLaDireccion < -UMBRAL_MOSTRAR) setVisible(true)
    }

    contenido.addEventListener('scroll', alDesplazar, { passive: true })
    return () => contenido.removeEventListener('scroll', alDesplazar)
  }, [contenidoRef])

  return { cabeceraRef, visible, altoCabecera }
}
