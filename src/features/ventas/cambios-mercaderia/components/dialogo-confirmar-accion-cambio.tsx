import {
  MOTIVOS_ANULACION_CAMBIO,
  MOTIVOS_EDICION_CAMBIO,
} from '@/features/ventas/cambios-mercaderia/config/motivos-cambio'
import type { ConfirmacionAccionCambio } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { describirPesoKg } from '@/features/ventas/cambios-mercaderia/utils/describir-articulo-cambio'
import { DialogoConfirmarConMotivo } from '@/features/ventas/components/dialogo-confirmar-con-motivo'
import { formatearMoneda } from '@/lib/formatear-moneda'

const TITULO_ERROR: Record<number, string> = {
  400: 'Datos rechazados',
  403: 'Se venció el plazo',
  404: 'El cambio ya no existe',
  409: 'No se pudo completar la acción',
}

/** Props del dialogo que confirma editar o anular un cambio y pide el motivo. */
interface DialogoConfirmarAccionCambioProps {
  /** null mientras no hay una confirmacion abierta. */
  confirmacion: ConfirmacionAccionCambio | null
  onConfirmar: () => void
  onCancelar: () => void
  onSeleccionarMotivo: (codigoMotivo: string) => void
  onCambiarDetalleMotivo: (detalleMotivo: string) => void
}

/** Que se revierte al anular: lo que entro (unidad o granel), lo entregado y, si hubo, el saldo de la caja. */
function describirReversion(confirmacion: ConfirmacionAccionCambio) {
  const { productoDevuelto, productoEntregado, saldoResultante } = confirmacion.fila
  const entrada = productoDevuelto.esBolsaAbierta
    ? `se descuentan ${describirPesoKg(productoDevuelto.pesoDevueltoKg ?? 0)} del stock a granel (bolsa abierta de «${productoDevuelto.nombreProducto}»)`
    : `se descuenta lo que entró del stock de «${productoDevuelto.nombreProducto}»`
  const salida = `se reintegra lo entregado de «${productoEntregado.nombreProducto}»`
  const caja = saldoResultante > 0 ? ` y se restan ${formatearMoneda(saldoResultante)} de la caja` : ''
  return `${entrada[0].toUpperCase()}${entrada.slice(1)}, ${salida}${caja}.`
}

/** Textos de los cambios sobre el dialogo generico de confirmacion con motivo. */
export function DialogoConfirmarAccionCambio({
  confirmacion,
  onConfirmar,
  onCancelar,
  onSeleccionarMotivo,
  onCambiarDetalleMotivo,
}: DialogoConfirmarAccionCambioProps) {
  const esAnulacion = confirmacion?.accion === 'ANULAR'

  return (
    <DialogoConfirmarConMotivo
      abierto={confirmacion !== null}
      titulo={
        <>
          {esAnulacion ? '¿Anular el cambio' : '¿Editar el cambio'}{' '}
          <span className="tabular-nums">N.º {confirmacion?.fila.idCambio}</span>?
        </>
      }
      descripcion={
        confirmacion
          ? esAnulacion
            ? `${describirReversion(confirmacion)} El cambio queda en la lista como Anulado y no se puede deshacer.`
            : `${describirReversion(confirmacion)} Después se vuelve a abrir el alta con sus datos para que los corrijas.`
          : ''
      }
      esDestructiva={esAnulacion}
      etiquetaConfirmar={esAnulacion ? 'Sí, anular cambio' : 'Sí, editar cambio'}
      etiquetaEnviando={esAnulacion ? 'Anulando…' : 'Editando…'}
      opcionesMotivo={esAnulacion ? MOTIVOS_ANULACION_CAMBIO : MOTIVOS_EDICION_CAMBIO}
      idPrefijoMotivo="motivo-accion-cambio"
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
