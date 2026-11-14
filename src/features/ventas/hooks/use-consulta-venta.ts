import { useEffect, useState } from 'react'
import { useSesion } from '@/features/auth/hooks/use-sesion'
import { consultarVentaApi, type DetalleVentaConsultado } from '@/features/ventas/api/consultar-venta-api'
import type { ErrorApi, ResultadoApi } from '@/lib/cliente-http.types'

/** Estado de la consulta del detalle de una venta. */
export type EstadoConsultaVenta =
  | { fase: 'cargando' }
  | { fase: 'error'; error: ErrorApi }
  | { fase: 'listo'; detalle: DetalleVentaConsultado }

interface CargaVenta {
  idVenta: number
  intento: number
  resultado: ResultadoApi<DetalleVentaConsultado>
}

/**
 * Pide GET /api/ventas/:idVenta mientras haya una venta indicada y permite repetir el pedido. Una recarga con el
 * detalle ya cargado es silenciosa: se sigue mostrando el anterior hasta que llegue el nuevo. Cambiar de venta o
 * pasar a null descarta lo cargado, asi que volver a abrir la misma venta siempre trae datos frescos.
 * @param idVenta Venta a consultar; null mientras no hay ninguna abierta.
 * @returns `estado` es null cuando no hay venta indicada.
 */
export function useConsultaVenta(idVenta: number | null) {
  const { cliente } = useSesion()

  // --- ESTADOS ---
  const [numeroIntento, setNumeroIntento] = useState(0)
  const [carga, setCarga] = useState<CargaVenta | null>(null)
  const [idVentaPrevio, setIdVentaPrevio] = useState(idVenta)

  // Cambiar de venta (o cerrar) descarta lo cargado de la anterior. Se ajusta durante el render, sin efecto aparte
  if (idVenta !== idVentaPrevio) {
    setIdVentaPrevio(idVenta)
    setCarga(null)
  }

  // --- EFECTOS ---
  // "vigente" descarta la respuesta de un pedido que ya no corresponde (otra venta, otro intento, desmontaje)
  useEffect(() => {
    if (idVenta === null) return
    let vigente = true
    void consultarVentaApi(cliente, String(idVenta)).then((resultado) => {
      if (vigente) setCarga({ idVenta, intento: numeroIntento, resultado })
    })
    return () => {
      vigente = false
    }
  }, [cliente, idVenta, numeroIntento])

  // --- CALCULOS ---
  const calcularEstado = (): EstadoConsultaVenta | null => {
    if (idVenta === null) return null
    const cargaDeEstaVenta = carga !== null && carga.idVenta === idVenta ? carga : null
    if (cargaDeEstaVenta === null) return { fase: 'cargando' }
    if (cargaDeEstaVenta.intento === numeroIntento) {
      return cargaDeEstaVenta.resultado.exitoso
        ? { fase: 'listo', detalle: cargaDeEstaVenta.resultado.datos }
        : { fase: 'error', error: cargaDeEstaVenta.resultado.error }
    }
    // Hay una recarga en camino: con un detalle ya cargado se lo sigue mostrando; si habia fallado, vuelve a "cargando"
    return cargaDeEstaVenta.resultado.exitoso
      ? { fase: 'listo', detalle: cargaDeEstaVenta.resultado.datos }
      : { fase: 'cargando' }
  }

  return { estado: calcularEstado(), recargar: () => setNumeroIntento((actual) => actual + 1) }
}
