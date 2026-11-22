import { Loader2, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatearMoneda } from '@/lib/formatear-moneda'
import type {
  EstadoConfirmacionConDeuda,
  EstadoPagoConDeuda,
} from '@/features/ventas/deudores/types/pago-con-deuda'
import { describirFechaEstimada } from '@/features/ventas/deudores/utils/fechas-estimadas'

/** Props del resumen que se confirma antes de registrar una venta con deuda. */
interface DialogoResumenVentaConDeudaProps {
  estadoPago: EstadoPagoConDeuda
  estadoConfirmacion: EstadoConfirmacionConDeuda
  onCerrar: () => void
  onConfirmar: () => void
  /** Tras un 404: vuelve al bloque Deuda para elegir a otra persona. */
  onCambiarDeudor: () => void
}

/** Una fila del resumen: etiqueta a la izquierda, dato a la derecha. */
function FilaResumen({ etiqueta, dato, destacada = false }: { etiqueta: string; dato: string; destacada?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-interno">
      <dt className="text-texto-suave">{etiqueta}</dt>
      <dd className={destacada ? 'text-cifra-secundaria font-bold tabular-nums' : 'font-medium tabular-nums'}>{dato}</dd>
    </div>
  )
}

/**
 * Antes de registrar una venta con deuda se muestra que se cobra ahora, cuanto queda debiendo, a quien y para cuando.
 * Es el unico paso extra: una deuda se cobra despues, y un error aca es mas caro que uno en una venta de contado.
 */
export function DialogoResumenVentaConDeuda({
  estadoPago,
  estadoConfirmacion,
  onCerrar,
  onConfirmar,
  onCambiarDeudor,
}: DialogoResumenVentaConDeudaProps) {
  const { resumen, deuda } = estadoPago
  const enviando = estadoConfirmacion.fase === 'enviando'
  const deudorInexistente = estadoConfirmacion.fase === 'error' && estadoConfirmacion.estadoHttp === 404

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && !enviando && onCerrar()}>
      <DialogContent aria-describedby="descripcion-resumen-deuda">
        <DialogHeader>
          <DialogTitle>Confirmar venta con deuda</DialogTitle>
          <DialogDescription id="descripcion-resumen-deuda">
            Revisá los datos: después de registrarla, la deuda se cobra desde Deudores.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <dl className="flex flex-col gap-interno text-cuerpo">
            <FilaResumen etiqueta="Importe de la venta" dato={formatearMoneda(resumen.importeVenta)} />
            <FilaResumen etiqueta="Paga ahora" dato={formatearMoneda(resumen.cobradoAhora)} />
            <div className="border-t pt-interno">
              <FilaResumen etiqueta="Queda debiendo" dato={formatearMoneda(resumen.queDebe)} destacada />
            </div>
            <div className="flex flex-col gap-interno border-t pt-interno">
              <FilaResumen etiqueta="Deudor" dato={deuda?.deudorElegido?.nombreCompleto ?? '—'} />
              <FilaResumen
                etiqueta="Fecha estimada de pago"
                dato={
                  deuda?.fechaEstimada?.modo === 'fecha'
                    ? describirFechaEstimada(deuda.fechaEstimada.fecha)
                    : describirFechaEstimada(null)
                }
              />
            </div>
          </dl>

          {estadoConfirmacion.fase === 'error' && (
            <Alert variant="destructive">
              <TriangleAlert aria-hidden="true" />
              <AlertTitle>{deudorInexistente ? 'El deudor ya no existe' : 'No se registró la venta'}</AlertTitle>
              <AlertDescription>
                <p>{estadoConfirmacion.mensaje}</p>
                {deudorInexistente && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-interno bg-fondo-tarjeta text-texto-principal"
                    onClick={onCambiarDeudor}
                  >
                    Elegir otro deudor
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" className="bg-fondo-tarjeta" disabled={enviando} onClick={onCerrar}>
            Volver
          </Button>
          <Button type="button" disabled={enviando || deudorInexistente} onClick={onConfirmar}>
            {enviando && <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}
            {enviando ? 'Registrando…' : 'Registrar venta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
