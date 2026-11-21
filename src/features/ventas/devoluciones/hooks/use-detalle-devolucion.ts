import { useEffect, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { consultarDevolucionApi } from '@/features/ventas/devoluciones/api/consultar-devolucion-api'
import type { DevolucionConsultada } from '@/features/ventas/devoluciones/api/convertir-devolucion-api'
import type { ErrorApi, ResultadoApi } from '@/lib/cliente-http.types'

/** Estado de la consulta del detalle de una devolución. */
export type EstadoConsultaDevolucion =
  | { fase: 'cargando' }
  | { fase: 'error'; error: ErrorApi }
  | { fase: 'listo'; consultado: DevolucionConsultada }

interface CargaDevolucion {
  idDevolucion: number
  intento: number
  resultado: ResultadoApi<DevolucionConsultada>
}

/**
 * Panel de detalle de Devoluciones: guarda cual devolución esta abierta y la pide a GET /api/cambios-mercaderia/:idDevolucion
 * al abrirlo. Una recarga con el detalle ya cargado es silenciosa: se sigue mostrando el anterior hasta que
 * llegue el nuevo. Cambiar de devolución o cerrar descarta lo cargado, asi que reabrir trae datos frescos.
 */
export function useDetalleDevolucion() {
  const { cliente } = useSesion()

  // --- ESTADOS ---
  const [idDevolucionAbierta, setIdDevolucionAbierta] = useState<number | null>(null)
  const [numeroIntento, setNumeroIntento] = useState(0)
  const [carga, setCarga] = useState<CargaDevolucion | null>(null)

  // --- EFECTOS ---
  // "vigente" descarta la respuesta de un pedido que ya no corresponde (otra devolución, otro intento, cierre)
  useEffect(() => {
    if (idDevolucionAbierta === null) return
    let vigente = true
    void consultarDevolucionApi(cliente, idDevolucionAbierta).then((resultado) => {
      if (vigente) setCarga({ idDevolucion: idDevolucionAbierta, intento: numeroIntento, resultado })
    })
    return () => {
      vigente = false
    }
  }, [cliente, idDevolucionAbierta, numeroIntento])

  // --- CALCULOS ---
  const calcularEstado = (): EstadoConsultaDevolucion | null => {
    if (idDevolucionAbierta === null) return null
    const cargaDeEstaDevolucion = carga !== null && carga.idDevolucion === idDevolucionAbierta ? carga : null
    if (cargaDeEstaDevolucion === null) return { fase: 'cargando' }
    if (cargaDeEstaDevolucion.intento === numeroIntento) {
      return cargaDeEstaDevolucion.resultado.exitoso
        ? { fase: 'listo', consultado: cargaDeEstaDevolucion.resultado.datos }
        : { fase: 'error', error: cargaDeEstaDevolucion.resultado.error }
    }
    // Hay una recarga en camino: con un detalle ya cargado se lo sigue mostrando; si habia fallado, vuelve a "cargando"
    return cargaDeEstaDevolucion.resultado.exitoso
      ? { fase: 'listo', consultado: cargaDeEstaDevolucion.resultado.datos }
      : { fase: 'cargando' }
  }

  // --- ACCIONES ---
  /** Abre el detalle de una devolución. Abrir la misma devolución otra vez la vuelve a pedir. */
  const abrir = (idDevolucion: number) => {
    setCarga(null)
    setNumeroIntento((actual) => actual + 1)
    setIdDevolucionAbierta(idDevolucion)
  }

  const cerrar = () => {
    setCarga(null)
    setIdDevolucionAbierta(null)
  }

  return {
    idDevolucionAbierta: idDevolucionAbierta,
    estadoConsulta: calcularEstado(),
    abrir,
    cerrar,
    /** Repite el pedido; con el detalle ya cargado, la recarga es silenciosa. */
    recargar: () => setNumeroIntento((actual) => actual + 1),
  }
}
