import { AltaCambio } from '@/features/ventas/cambios-mercaderia/components/alta-cambio'
import { useAltaCambioEjemplo } from '@/features/ventas/cambios-mercaderia/hooks/use-alta-cambio-ejemplo'
import type { BorradorCambio, CambioMercaderiaDetalle } from '@/features/ventas/cambios-mercaderia/types/cambio'
import type { VentaDetalle } from '@/features/ventas/types/historial'

/** Props del contenedor que conecta el hook del alta con su modal. */
interface ContenedorAltaCambioProps {
  ventas: VentaDetalle[]
  cambios: CambioMercaderiaDetalle[]
  /** Datos con los que se reabre el alta al editar un cambio; null en un alta nueva. */
  borradorInicial: BorradorCambio | null
  onCambioRegistrado: (cambio: CambioMercaderiaDetalle) => void
  onVerDetalleCambio: (idCambio: number) => void
  onCerrar: () => void
}

/**
 * Se monta al abrir el alta y se desmonta al cerrarla, asi el estado del formulario nace limpio cada vez
 * (el mismo patron que el cobro de un fiado en el Historial).
 */
export function ContenedorAltaCambio(props: ContenedorAltaCambioProps) {
  const propiedadesAlta = useAltaCambioEjemplo(props)
  return <AltaCambio {...propiedadesAlta} />
}
