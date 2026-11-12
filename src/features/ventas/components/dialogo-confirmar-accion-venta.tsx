import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { ConfirmacionAccionVenta } from '@/features/ventas/types/historial'

const TITULO_ERROR: Record<403 | 404 | 409, string> = {
  403: 'Se venció el plazo',
  404: 'La venta ya no existe',
  409: 'No se pudo completar la acción',
}

/** Props del dialogo que confirma editar o anular una venta. */
interface DialogoConfirmarAccionVentaProps {
  /** null mientras no hay una confirmacion abierta. */
  confirmacion: ConfirmacionAccionVenta | null
  onEditarVenta: (idVenta: number) => void
  onAnularVenta: (idVenta: number) => void
  onCancelar: () => void
}

export function DialogoConfirmarAccionVenta({
  confirmacion,
  onEditarVenta,
  onAnularVenta,
  onCancelar,
}: DialogoConfirmarAccionVentaProps) {
  const esAnulacion = confirmacion?.accion === 'ANULAR'

  return (
    <AlertDialog
      open={confirmacion !== null}
      // Mientras se espera al servidor no se puede cerrar: la accion ya esta en camino
      onOpenChange={(abierto) => {
        if (!abierto && !confirmacion?.enviando) onCancelar()
      }}
    >
      <AlertDialogContent>
        {confirmacion && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {esAnulacion ? '¿Anular la venta?' : '¿Editar la venta?'}{' '}
                <span className="tabular-nums">{confirmacion.fila.numeroComprobante}</span>
              </AlertDialogTitle>
              <AlertDialogDescription>
                {esAnulacion
                  ? 'Se repone el stock y, si estaba cobrada, se revierte la caja. La venta queda en el historial como Anulada y no se puede deshacer.'
                  : 'Editar anula esta venta, repone el stock, revierte la caja si estaba cobrada y vuelve a abrir Registrar Venta con sus datos.'}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* --- RECHAZO DEL SERVIDOR --- */}
            {confirmacion.error && (
              <Alert variant="destructive">
                <TriangleAlert aria-hidden="true" />
                <AlertTitle>{TITULO_ERROR[confirmacion.error.estadoHttp]}</AlertTitle>
                <AlertDescription>
                  <p>{confirmacion.error.mensaje}</p>
                </AlertDescription>
              </Alert>
            )}

            <AlertDialogFooter>
              {confirmacion.error ? (
                <AlertDialogCancel className="h-11 px-6">Entendido</AlertDialogCancel>
              ) : (
                <>
                  <AlertDialogCancel className="h-11 px-6" disabled={confirmacion.enviando}>
                    Volver
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant={esAnulacion ? 'destructive' : 'default'}
                    className="h-11 px-6"
                    disabled={confirmacion.enviando}
                    // preventDefault: el dialogo queda abierto hasta que responda el servidor
                    onClick={(evento) => {
                      evento.preventDefault()
                      const idVenta = confirmacion.fila.idVenta
                      if (esAnulacion) onAnularVenta(idVenta)
                      else onEditarVenta(idVenta)
                    }}
                  >
                    {confirmacion.enviando
                      ? esAnulacion
                        ? 'Anulando…'
                        : 'Editando…'
                      : esAnulacion
                        ? 'Sí, anular venta'
                        : 'Sí, editar venta'}
                  </AlertDialogAction>
                </>
              )}
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}
