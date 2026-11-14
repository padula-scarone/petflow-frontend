import { useEffect, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { consultarCambioApi } from '@/features/ventas/cambios-mercaderia/api/consultar-cambio-api'
import type { CambioConsultado } from '@/features/ventas/cambios-mercaderia/api/convertir-cambio-api'
import type { ErrorApi, ResultadoApi } from '@/lib/cliente-http.types'

/** Estado de la consulta del detalle de un cambio. */
export type EstadoConsultaCambio =
  | { fase: 'cargando' }
  | { fase: 'error'; error: ErrorApi }
  | { fase: 'listo'; consultado: CambioConsultado }

interface CargaCambio {
  idCambio: number
  intento: number
  resultado: ResultadoApi<CambioConsultado>
}

/**
 * Panel de detalle de Cambios: guarda cual cambio esta abierto y lo pide a GET /api/cambios-mercaderia/:idCambio
 * al abrirlo. Una recarga con el detalle ya cargado es silenciosa: se sigue mostrando el anterior hasta que
 * llegue el nuevo. Cambiar de cambio o cerrar descarta lo cargado, asi que reabrir trae datos frescos.
 */
export function useDetalleCambio() {
  const { cliente } = useSesion()

  // --- ESTADOS ---
  const [idCambioAbierto, setIdCambioAbierto] = useState<number | null>(null)
  const [numeroIntento, setNumeroIntento] = useState(0)
  const [carga, setCarga] = useState<CargaCambio | null>(null)

  // --- EFECTOS ---
  // "vigente" descarta la respuesta de un pedido que ya no corresponde (otro cambio, otro intento, cierre)
  useEffect(() => {
    if (idCambioAbierto === null) return
    let vigente = true
    void consultarCambioApi(cliente, idCambioAbierto).then((resultado) => {
      if (vigente) setCarga({ idCambio: idCambioAbierto, intento: numeroIntento, resultado })
    })
    return () => {
      vigente = false
    }
  }, [cliente, idCambioAbierto, numeroIntento])

  // --- CALCULOS ---
  const calcularEstado = (): EstadoConsultaCambio | null => {
    if (idCambioAbierto === null) return null
    const cargaDeEsteCambio = carga !== null && carga.idCambio === idCambioAbierto ? carga : null
    if (cargaDeEsteCambio === null) return { fase: 'cargando' }
    if (cargaDeEsteCambio.intento === numeroIntento) {
      return cargaDeEsteCambio.resultado.exitoso
        ? { fase: 'listo', consultado: cargaDeEsteCambio.resultado.datos }
        : { fase: 'error', error: cargaDeEsteCambio.resultado.error }
    }
    // Hay una recarga en camino: con un detalle ya cargado se lo sigue mostrando; si habia fallado, vuelve a "cargando"
    return cargaDeEsteCambio.resultado.exitoso
      ? { fase: 'listo', consultado: cargaDeEsteCambio.resultado.datos }
      : { fase: 'cargando' }
  }

  // --- ACCIONES ---
  /** Abre el detalle de un cambio. Abrir el mismo cambio otra vez lo vuelve a pedir. */
  const abrir = (idCambio: number) => {
    setCarga(null)
    setNumeroIntento((actual) => actual + 1)
    setIdCambioAbierto(idCambio)
  }

  const cerrar = () => {
    setCarga(null)
    setIdCambioAbierto(null)
  }

  return {
    idCambioAbierto,
    estadoConsulta: calcularEstado(),
    abrir,
    cerrar,
    /** Repite el pedido; con el detalle ya cargado, la recarga es silenciosa. */
    recargar: () => setNumeroIntento((actual) => actual + 1),
  }
}
