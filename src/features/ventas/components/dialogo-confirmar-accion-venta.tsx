import { DialogoConfirmarConMotivo } from '@/features/ventas/components/dialogo-confirmar-con-motivo'
import { MOTIVOS_ANULACION, MOTIVOS_EDICION } from '@/features/ventas/config/motivos-venta'
import type { CodigoMotivo, ConfirmacionAccionVenta } from '@/features/ventas/types/historial'

const TITULO_ERROR: Record<number, string> = {
  0: 'No pudimos confirmar el resultado',
  400: 'El motivo no es válido',
  403: 'Se venció el plazo',
  404: 'La venta ya no existe',
  409: 'No se pudo completar la acción',
}

/** Props del dialogo que confirma editar o anular una venta y pide el motivo. */
interface DialogoConfirmarAccionVentaProps {
  /** null mientras no hay una confirmacion abierta. */
  confirmacion: ConfirmacionAccionVenta | null
  onEditarVenta: (idVenta: number) => void
  onAnularVenta: (idVenta: number) => void
  onCancelar: () => void
  onSeleccionarMotivo: (codigoMotivo: CodigoMotivo) => void
  onCambiarDetalleMotivo: (detalleMotivo: string) => void
}

/** Textos de la venta sobre el dialogo generico de confirmacion con motivo. */
export function DialogoConfirmarAccionVenta({
  confirmacion,
  onEditarVenta,
  onAnularVenta,
  onCancelar,
  onSeleccionarMotivo,
  onCambiarDetalleMotivo,
}: DialogoConfirmarAccionVentaProps) {
  const esAnulacion = confirmacion?.accion === 'ANULAR'

  return (
    <DialogoConfirmarConMotivo
      abierto={confirmacion !== null}
      titulo={
        <>
          {esAnulacion ? '¿Anular la venta?' : '¿Editar la venta?'}{' '}
          <span className="tabular-nums">{confirmacion?.fila.numeroComprobante}</span>
        </>
      }
      descripcion={
        esAnulacion
          ? 'Se repone el stock y, si estaba cobrada, se revierte la caja. La venta queda en el historial como Anulada y no se puede deshacer.'
          : 'Editar anula esta venta, repone el stock, revierte la caja si estaba cobrada y vuelve a abrir Registrar Venta con sus datos.'
      }
      esDestructiva={esAnulacion}
      etiquetaConfirmar={esAnulacion ? 'Sí, anular venta' : 'Sí, editar venta'}
      etiquetaEnviando={esAnulacion ? 'Anulando…' : 'Editando…'}
      opcionesMotivo={esAnulacion ? MOTIVOS_ANULACION : MOTIVOS_EDICION}
      idPrefijoMotivo="motivo-venta"
      codigoMotivo={confirmacion?.codigoMotivo ?? null}
      detalleMotivo={confirmacion?.detalleMotivo ?? ''}
      motivoValido={confirmacion?.motivoValido ?? false}
      enviando={confirmacion?.enviando ?? false}
      error={confirmacion?.error ?? null}
      titulosError={TITULO_ERROR}
      onConfirmar={() => {
        if (!confirmacion) return
        if (esAnulacion) onAnularVenta(confirmacion.fila.idVenta)
        else onEditarVenta(confirmacion.fila.idVenta)
      }}
      onCancelar={onCancelar}
      onSeleccionarMotivo={(codigoMotivo) => onSeleccionarMotivo(codigoMotivo as CodigoMotivo)}
      onCambiarDetalleMotivo={onCambiarDetalleMotivo}
    />
  )
}
