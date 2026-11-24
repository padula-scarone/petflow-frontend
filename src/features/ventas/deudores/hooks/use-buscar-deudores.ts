import { useEffect, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { buscarDeudoresApi } from '@/features/ventas/deudores/api/deudores-api'
import { MENSAJE_BUSQUEDA_DEUDORES_FALLIDA } from '@/features/ventas/deudores/config/mensajes-deudores'
import {
  ESPERA_BUSQUEDA_MILISEGUNDOS,
  SUGERENCIAS_DEUDOR_MAXIMAS,
} from '@/features/ventas/deudores/config/reglas-deudores'
import type { EstadoBusquedaDeudor, ResultadoBusquedaDeudor } from '@/features/ventas/deudores/types/deudor'

/**
 * Busca deudores por nombre o DNI mientras se escribe (GET /api/deudores?busqueda=), esperando a que se deje de tipear.
 * No consulta con el texto vacio (el back trae a todos) ni repite un texto que ya tiene resultado (RNF-GENERAL-02).
 * El estado se deriva del texto y de los resultados guardados por texto: sin resultado para el texto actual, la
 * busqueda sigue "cargando". Una respuesta de un texto que ya cambio se descarta.
 */
export function useBuscarDeudores() {
  const { cliente } = useSesion()

  // --- ESTADOS ---
  const [textoBusqueda, setTextoBusqueda] = useState('')
  // Resultado de cada texto ya consultado. Un error tambien se guarda, pero "reintentar" lo quita para consultar de nuevo
  const [resultadosPorTexto, setResultadosPorTexto] = useState<Record<string, ResultadoBusquedaDeudor>>({})
  const [numeroReintento, setNumeroReintento] = useState(0)

  const textoRecortado = textoBusqueda.trim()
  const resultadoConocido = resultadosPorTexto[textoRecortado]

  // --- EFECTOS ---
  // "vigente" descarta la respuesta de un texto que ya cambio
  useEffect(() => {
    if (textoRecortado === '' || resultadoConocido !== undefined) return
    let vigente = true
    const temporizador = setTimeout(() => {
      void buscarDeudoresApi(cliente, {
        busqueda: textoRecortado,
        cantidadPorPagina: SUGERENCIAS_DEUDOR_MAXIMAS,
      }).then((respuesta) => {
        if (!vigente) return
        const resultado: ResultadoBusquedaDeudor = !respuesta.exitoso
          ? { fase: 'error', mensaje: MENSAJE_BUSQUEDA_DEUDORES_FALLIDA }
          : respuesta.datos.length === 0
            ? { fase: 'sin-resultados', textoBuscado: textoRecortado }
            : { fase: 'con-resultados', deudores: respuesta.datos }
        setResultadosPorTexto((actuales) => ({ ...actuales, [textoRecortado]: resultado }))
      })
    }, ESPERA_BUSQUEDA_MILISEGUNDOS)
    return () => {
      vigente = false
      clearTimeout(temporizador)
    }
  }, [cliente, textoRecortado, resultadoConocido, numeroReintento])

  // --- CALCULOS ---
  const calcularEstado = (): EstadoBusquedaDeudor => {
    if (textoRecortado === '') return { fase: 'inactivo' }
    return resultadoConocido ?? { fase: 'cargando' }
  }

  return {
    textoBusqueda,
    estadoBusqueda: calcularEstado(),
    buscar: setTextoBusqueda,
    /** Vuelve a consultar el texto actual, que habia terminado en error. */
    reintentar: () => {
      setResultadosPorTexto((actuales) =>
        Object.fromEntries(Object.entries(actuales).filter(([texto]) => texto !== textoRecortado)),
      )
      setNumeroReintento((actual) => actual + 1)
    },
    limpiar: () => setTextoBusqueda(''),
    /** Olvida los resultados guardados: despues de dar de alta un deudor, uno nuevo tiene que poder aparecer. */
    olvidarResultados: () => setResultadosPorTexto({}),
  }
}
