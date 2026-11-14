import { AltaCambio } from '@/features/ventas/cambios-mercaderia/components/alta-cambio'
import { useAltaCambio } from '@/features/ventas/cambios-mercaderia/hooks/use-alta-cambio'
import type { AltaRepoblada, CambioMercaderiaDetalle } from '@/features/ventas/cambios-mercaderia/types/cambio'

/** Props del contenedor que conecta el hook del alta con su modal. */
interface ContenedorAltaCambioProps {
  /** Datos con los que se reabre el alta al editar un cambio; null en un alta nueva. */
  altaRepoblada: AltaRepoblada | null
  desfaseServidorMilisegundos: number
  onCambioRegistrado: (cambio: CambioMercaderiaDetalle) => void
  onVerDetalleCambio: (idCambio: number) => void
  onActualizarLista: () => void
  onCerrar: () => void
}

/**
 * Se monta al abrir el alta y se desmonta al cerrarla, asi el estado del formulario nace limpio cada vez
 * (el mismo patron que el cobro de un fiado en el Historial).
 */
export function ContenedorAltaCambio(props: ContenedorAltaCambioProps) {
  const propiedadesAlta = useAltaCambio(props)
  return <AltaCambio {...propiedadesAlta} />
}
