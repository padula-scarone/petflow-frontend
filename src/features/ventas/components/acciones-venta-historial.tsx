import { AccionesRegistroModificable } from '@/features/ventas/components/acciones-registro-modificable'
import type { FilaHistorial, PropiedadesAccionesVenta } from '@/features/ventas/types/historial'

/** Props de los botones Ver, Editar y Anular de una venta. */
interface AccionesVentaHistorialProps {
  fila: FilaHistorial
  acciones: PropiedadesAccionesVenta
  /**
   * tabla: botones de solo icono con tooltip. tarjeta: texto corto, en fila.
   * detalle: Editar y Anular en el pie del panel (Ver no hace falta: ya se esta viendo).
   */
  variante: 'tabla' | 'tarjeta' | 'detalle'
}

/** Acciones de una venta del historial: enlaza los callbacks con los botones genericos. */
export function AccionesVentaHistorial({ fila, acciones, variante }: AccionesVentaHistorialProps) {
  const { idVenta, numeroComprobante, ventanaVigente } = fila

  return (
    <AccionesRegistroModificable
      nombreRegistro={`comprobante ${numeroComprobante}`}
      sustantivo="venta"
      ventanaVigente={ventanaVigente}
      variante={variante}
      onVerDetalle={() => acciones.onVerDetalle(idVenta)}
      onEditar={() => acciones.onSolicitarAccion('EDITAR', idVenta)}
      onAnular={() => acciones.onSolicitarAccion('ANULAR', idVenta)}
    />
  )
}
