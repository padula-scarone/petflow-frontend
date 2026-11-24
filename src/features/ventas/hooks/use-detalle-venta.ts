import { useState } from 'react'
import { useConsultaVenta } from '@/features/ventas/hooks/use-consulta-venta'

/**
 * Panel de detalle del Historial: guarda cual venta esta abierta y la consulta al back.
 */
export function useDetalleVenta() {
  const [idVentaAbierta, setIdVentaAbierta] = useState<number | null>(null)
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
