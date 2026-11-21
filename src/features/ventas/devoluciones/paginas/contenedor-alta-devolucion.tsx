import { AltaDevolucion } from '@/features/ventas/devoluciones/components/alta-devolucion'
import { useAltaDevolucion } from '@/features/ventas/devoluciones/hooks/use-alta-devolucion'
import type { AltaRepoblada, DevolucionDetalle } from '@/features/ventas/devoluciones/types/devolucion'

/** Props del contenedor que conecta el hook del alta con su modal. */
interface ContenedorAltaDevolucionProps {
  /** Datos con los que se reabre el alta al editar una devolución; null en un alta nueva. */
  altaRepoblada: AltaRepoblada | null
  desfaseServidorMilisegundos: number
  onDevolucionRegistrada: (devolucion: DevolucionDetalle) => void
  onVerDetalleDevolucion: (idDevolucion: number) => void
  onActualizarLista: () => void
  onCerrar: () => void
}

/**
 * Se monta al abrir el alta y se desmonta al cerrarla, asi el estado del formulario nace limpio cada vez
 * (el mismo patron que el cobro de un fiado en el Historial).
 */
export function ContenedorAltaDevolucion(props: ContenedorAltaDevolucionProps) {
  const propiedadesAlta = useAltaDevolucion(props)
  return <AltaDevolucion {...propiedadesAlta} />
}
