import { useState } from 'react'
import { useConsultaVenta } from '@/features/ventas/hooks/use-consulta-venta'

/**
 * Panel de detalle del Historial: guarda cual venta esta abierta y la consulta al back.
 * @param idVentaInicial Venta que se abre al montar (viene de `?venta=` cuando se llega desde Editar); null si ninguna.
 */
export function useDetalleVenta(idVentaInicial: number | null) {
  const [idVentaAbierta, setIdVentaAbierta] = useState<number | null>(idVentaInicial)
  const consulta = useConsultaVenta(idVentaAbierta)

  return {
    idVentaAbierta,
    estadoConsulta: consulta.estado,
    abrir: setIdVentaAbierta,
    cerrar: () => setIdVentaAbierta(null),
    /** Repite el pedido; con el detalle ya cargado, la recarga es silenciosa. */
    recargar: consulta.recargar,
  }
}
