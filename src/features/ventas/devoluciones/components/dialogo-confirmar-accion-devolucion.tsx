import {
  MOTIVOS_ANULACION_DEVOLUCION,
  MOTIVOS_EDICION_DEVOLUCION,
} from '@/features/ventas/devoluciones/config/motivos-devolucion'
import type { ConfirmacionAccionDevolucion } from '@/features/ventas/devoluciones/types/devolucion'
import { describirPesoKg } from '@/features/ventas/devoluciones/utils/describir-articulo-devolucion'
import { DialogoConfirmarConMotivo } from '@/features/ventas/components/dialogo-confirmar-con-motivo'
import { formatearMoneda } from '@/lib/formatear-moneda'

const TITULO_ERROR: Record<number, string> = {
  400: 'Datos rechazados',
  403: 'Se venció el plazo',
  404: 'La devolución ya no existe',
  409: 'No se pudo completar la acción',
}

/** Props del dialogo que confirma editar o anular una devolución y pide el motivo. */
interface DialogoConfirmarAccionDevolucionProps {
  /** null mientras no hay una confirmacion abierta. */
  confirmacion: ConfirmacionAccionDevolucion | null
  onConfirmar: () => void
  onCancelar: () => void
  onSeleccionarMotivo: (codigoMotivo: string) => void
  onCambiarDetalleMotivo: (detalleMotivo: string) => void
}

/** Que se revierte al anular: lo que entro (unidad o granel), lo entregado y, si hubo, el saldo de la caja. */
function describirReversion(confirmacion: ConfirmacionAccionDevolucion) {
  const { productoDevuelto, productoEntregado, saldoResultante } = confirmacion.fila
  const entrada = productoDevuelto.esBolsaAbierta
    ? `se descuentan ${describirPesoKg(productoDevuelto.pesoDevueltoKg ?? 0)} del stock a granel (bolsa abierta de «${productoDevuelto.nombreProducto}»)`
    : `se descuenta lo que entró del stock de «${productoDevuelto.nombreProducto}»`
  const salida = `se reintegra lo entregado de «${productoEntregado.nombreProducto}»`
  const caja = saldoResultante > 0 ? ` y se restan ${formatearMoneda(saldoResultante)} de la caja` : ''
  return `${entrada[0].toUpperCase()}${entrada.slice(1)}, ${salida}${caja}.`
}

/** Textos de las devoluciones sobre el dialogo generico de confirmacion con motivo. */
export function DialogoConfirmarAccionDevolucion({
  confirmacion,
  onConfirmar,
  onCancelar,
  onSeleccionarMotivo,
  onCambiarDetalleMotivo,
}: DialogoConfirmarAccionDevolucionProps) {
  const esAnulacion = confirmacion?.accion === 'ANULAR'

  return (
    <DialogoConfirmarConMotivo
      abierto={confirmacion !== null}
      titulo={
        <>
          {esAnulacion ? '¿Anular la devolución' : '¿Editar la devolución'}{' '}
          <span className="tabular-nums">N.º {confirmacion?.fila.idDevolucion}</span>?
        </>
      }
      descripcion={
        confirmacion
          ? esAnulacion
            ? `${describirReversion(confirmacion)} La devolución queda en la lista como Anulada y no se puede deshacer.`
            : `${describirReversion(confirmacion)} Después se vuelve a abrir el alta con sus datos para que los corrijas.`
          : ''
      }
      esDestructiva={esAnulacion}
      etiquetaConfirmar={esAnulacion ? 'Sí, anular devolución' : 'Sí, editar devolución'}
      etiquetaEnviando={esAnulacion ? 'Anulando…' : 'Editando…'}
      opcionesMotivo={esAnulacion ? MOTIVOS_ANULACION_DEVOLUCION : MOTIVOS_EDICION_DEVOLUCION}
      idPrefijoMotivo="motivo-accion-devolucion"
      codigoMotivo={confirmacion?.codigoMotivo ?? null}
      detalleMotivo={confirmacion?.detalleMotivo ?? ''}
      motivoValido={confirmacion?.motivoValido ?? false}
      enviando={confirmacion?.enviando ?? false}
      error={confirmacion?.error ?? null}
      titulosError={TITULO_ERROR}
      onConfirmar={onConfirmar}
      onCancelar={onCancelar}
      onSeleccionarMotivo={onSeleccionarMotivo}
      onCambiarDetalleMotivo={onCambiarDetalleMotivo}
    />
  )
}
