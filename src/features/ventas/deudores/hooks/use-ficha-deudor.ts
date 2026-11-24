import { useEffect, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { consultarEstadoCuentaApi } from '@/features/ventas/deudores/api/cuentas-corrientes-api'
import type { CuentaDeudor, EstadoFichaDeudor } from '@/features/ventas/deudores/types/cuenta-corriente'
import { traducirErrorConsulta } from '@/features/ventas/utils/traducir-error-venta'
import type { ResultadoApi } from '@/lib/cliente-http.types'

const ESTADO_NO_ENCONTRADO = 404

/** Lo ultimo que llego para un deudor; se guarda con su id para no mostrar la cuenta de otro. */
interface CargaFicha {
  idDeudor: number
  resultado: ResultadoApi<CuentaDeudor>
}

/**
 * Ficha de un deudor: sus datos, su saldo y sus fiados pendientes (GET /api/cuentas-corrientes/:idDeudor). Despues de
 * una accion (cobrar, editar al deudor) la verdad la tiene el servidor: `refrescar` vuelve a pedir la cuenta sin
 * mostrar "cargando", y la ficha sigue en pantalla con lo anterior hasta que llega lo nuevo.
 */
export function useFichaDeudor(idDeudor: number) {
  const { cliente } = useSesion()

  // --- ESTADOS ---
  const [numeroReintento, setNumeroReintento] = useState(0)
  const [numeroRefresco, setNumeroRefresco] = useState(0)
  const [carga, setCarga] = useState<CargaFicha | null>(null)

  // --- EFECTOS ---
  // "vigente" descarta la respuesta de una consulta vieja
  useEffect(() => {
    let vigente = true
    void consultarEstadoCuentaApi(cliente, idDeudor).then((resultado) => {
      if (!vigente) return
      setCarga((actual) =>
        // Si un refresco silencioso falla, se conserva la cuenta que ya se estaba mostrando
        !resultado.exitoso && actual?.idDeudor === idDeudor && actual.resultado.exitoso
          ? actual
          : { idDeudor, resultado },
      )
    })
    return () => {
      vigente = false
    }
  }, [cliente, idDeudor, numeroReintento, numeroRefresco])

  // --- CALCULOS ---
  const calcularEstado = (): EstadoFichaDeudor => {
    if (carga === null || carga.idDeudor !== idDeudor) return { tipo: 'cargando' }
    const { resultado } = carga
    if (resultado.exitoso) return { tipo: 'listo', ...resultado.datos }
    if (resultado.error.estado === ESTADO_NO_ENCONTRADO && resultado.error.codigo === 'DEUDOR_NO_ENCONTRADO') {
      return { tipo: 'no-encontrado' }
    }
    return { tipo: 'error', mensaje: traducirErrorConsulta(resultado.error, 'la cuenta del deudor', 'ver a los deudores') }
  }

  return {
    estadoFicha: calcularEstado(),
    /** Vuelve a pedir la ficha mostrando "cargando" (despues de un error). */
    reintentar: () => {
      setCarga(null)
      setNumeroReintento((actual) => actual + 1)
    },
    /** Vuelve a pedir la ficha sin mostrar "cargando" (despues de cobrar o de editar al deudor). */
    refrescar: () => setNumeroRefresco((actual) => actual + 1),
  }
}
