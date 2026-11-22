import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  consultarFichaApiEjemplo,
  type ResultadoFichaDeudor,
} from '@/features/ventas/deudores/ejemplos/api-deudores-ejemplo'
import { asegurarFiadoDeHistorial } from '@/features/ventas/deudores/ejemplos/cuenta-corriente-ejemplo'
import {
  obtenerVersionAlmacenDeudores,
  suscribirAlmacenDeudores,
} from '@/features/ventas/deudores/ejemplos/estado-almacen-ejemplo'
import type { EstadoFichaDeudor, FiadoOrigenHistorial } from '@/features/ventas/deudores/types/cuenta-corriente'

const MENSAJE_FICHA_NO_CARGADA = 'No pudimos cargar al deudor. Revisá tu conexión e intentá de nuevo.'

/** Lo ultimo que llego para un deudor; se guarda con su id para no mostrar la cuenta de otro. */
interface CargaFicha {
  idDeudor: number
  resultado: ResultadoFichaDeudor
}

/**
 * Ficha de un deudor: sus datos, su saldo y sus fiados pendientes (de ejemplo, hasta que el back tenga el estado
 * de cuenta). Cuando la cuenta cambia (se cobra, se edita, se vende) se vuelve a pedir sin mostrar "cargando": la
 * ficha sigue en pantalla con lo anterior hasta que llega lo nuevo.
 */
export function useFichaDeudorEjemplo(idDeudor: number, fiadoOrigen: FiadoOrigenHistorial | null) {
  // Una foto del almacen: cambia con cada cobro, edicion o venta, y dispara una nueva consulta
  const versionAlmacen = useSyncExternalStore(suscribirAlmacenDeudores, obtenerVersionAlmacenDeudores)

  // --- ESTADOS ---
  const [numeroReintento, setNumeroReintento] = useState(0)
  const [carga, setCarga] = useState<CargaFicha | null>(null)

  // --- EFECTOS ---
  // El fiado que mostraba el Historial se agrega a la cuenta del deudor antes de leerla (solo en la maqueta)
  useEffect(() => {
    if (fiadoOrigen !== null) asegurarFiadoDeHistorial(idDeudor, fiadoOrigen)
  }, [idDeudor, fiadoOrigen])

  // "vigente" descarta la respuesta de una consulta vieja
  useEffect(() => {
    let vigente = true
    void consultarFichaApiEjemplo(idDeudor).then((resultado) => {
      if (vigente) setCarga({ idDeudor, resultado })
    })
    return () => {
      vigente = false
    }
  }, [idDeudor, versionAlmacen, numeroReintento])

  // --- CALCULOS ---
  const calcularEstado = (): EstadoFichaDeudor => {
    if (carga === null || carga.idDeudor !== idDeudor) return { tipo: 'cargando' }
    const { resultado } = carga
    if (resultado.tipo === 'error') return { tipo: 'error', mensaje: MENSAJE_FICHA_NO_CARGADA }
    if (resultado.tipo === 'no-encontrado') return { tipo: 'no-encontrado' }
    const { deudor, saldo, fiados } = resultado.ficha
    return { tipo: 'listo', deudor, saldo, fiados }
  }

  return {
    estadoFicha: calcularEstado(),
    /** Vuelve a pedir la ficha mostrando "cargando" (despues de un error). */
    reintentar: () => {
      setCarga(null)
      setNumeroReintento((actual) => actual + 1)
    },
  }
}
