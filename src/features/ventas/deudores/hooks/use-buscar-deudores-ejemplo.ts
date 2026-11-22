import { useEffect, useState } from 'react'
import { ESPERA_BUSQUEDA_MILISEGUNDOS } from '@/features/ventas/deudores/config/reglas-deudores'
import { buscarDeudoresApiEjemplo } from '@/features/ventas/deudores/ejemplos/api-deudores-ejemplo'
import type { EstadoBusquedaDeudor, ResultadoBusquedaDeudor } from '@/features/ventas/deudores/types/deudor'

/** El resultado guardado lleva el texto que lo origino: una respuesta de otro texto no vale. */
interface ResultadoGuardado {
  texto: string
  resultado: ResultadoBusquedaDeudor
}

/**
 * Busca deudores por nombre o DNI mientras se escribe, esperando a que se deje de tipear. El estado se deriva del
 * texto y del ultimo resultado: si el resultado es de otro texto, la busqueda sigue "cargando".
 */
export function useBuscarDeudoresEjemplo() {
  // --- ESTADOS ---
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [resultadoGuardado, setResultadoGuardado] = useState<ResultadoGuardado | null>(null)
  const [numeroReintento, setNumeroReintento] = useState(0)

  const textoRecortado = textoBusqueda.trim()

  // --- EFECTOS ---
  // "vigente" descarta la respuesta de un texto que ya cambio
  useEffect(() => {
    if (textoRecortado === '') return
    let vigente = true
    const temporizador = setTimeout(() => {
      void buscarDeudoresApiEjemplo(textoRecortado).then((resultado) => {
        if (vigente) setResultadoGuardado({ texto: textoRecortado, resultado })
      })
    }, ESPERA_BUSQUEDA_MILISEGUNDOS)
    return () => {
      vigente = false
      clearTimeout(temporizador)
    }
  }, [textoRecortado, numeroReintento])

  // --- CALCULOS ---
  const calcularEstado = (): EstadoBusquedaDeudor => {
    if (textoRecortado === '') return { fase: 'inactivo' }
    if (resultadoGuardado?.texto === textoRecortado) return resultadoGuardado.resultado
    return { fase: 'cargando' }
  }

  return {
    textoBusqueda,
    estadoBusqueda: calcularEstado(),
    buscar: (texto: string) => {
      setTextoBusqueda(texto)
      // Un texto nuevo no debe mostrar el resultado de la busqueda anterior mientras llega el suyo
      setResultadoGuardado(null)
    },
    reintentar: () => {
      setResultadoGuardado(null)
      setNumeroReintento((actual) => actual + 1)
    },
    limpiar: () => {
      setTextoBusqueda('')
      setResultadoGuardado(null)
    },
  }
}
