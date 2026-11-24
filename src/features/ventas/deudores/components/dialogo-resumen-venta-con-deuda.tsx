import { Loader2, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatearMoneda } from "@/lib/formatear-moneda";
import type {
  EstadoConfirmacionConDeuda,
  EstadoPagoConDeuda,
} from "@/features/ventas/deudores/types/pago-con-deuda";
import { describirFechaEstimada } from "@/features/ventas/deudores/utils/fechas-estimadas";

/** Props del resumen que se confirma antes de registrar una venta con deuda. */
interface DialogoResumenVentaConDeudaProps {
  estadoPago: EstadoPagoConDeuda;
  estadoConfirmacion: EstadoConfirmacionConDeuda;
  onCerrar: () => void;
  onConfirmar: () => void;
  /** Tras un 404: vuelve al bloque Deuda para elegir a otra persona. */
  onCambiarDeudor: () => void;
  /** Con el pago inicial sin registrar: sigue con la venta como deuda total. */
  onContinuarSinPagoInicial: () => void;
  /** Con la venta incierta: descarta la venta en curso. */
  onAbandonarVentaIncierta: () => void;
}

/** Una fila del resumen: etiqueta a la izquierda, dato a la derecha. */
function FilaResumen({
  etiqueta,
  dato,
  destacada = false,
}: {
  etiqueta: string;
  dato: string;
  destacada?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-interno">
      <dt className="text-texto-suave">{etiqueta}</dt>
      <dd
        className={
          destacada
            ? "text-cifra-secundaria font-bold tabular-nums"
            : "font-medium tabular-nums"
        }
      >
        {dato}
      </dd>
    </div>
  );
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
  onContinuarSinPagoInicial,
  onAbandonarVentaIncierta,
}: DialogoResumenVentaConDeudaProps) {
  const { resumen, deuda } = estadoPago;
  const { fase } = estadoConfirmacion;
  const enviando = fase === "enviando";
  const deudorInexistente =
    fase === "error" && estadoConfirmacion.estadoHttp === 404;
  // Una vez que la venta existe, el dialogo no se cierra con un toque afuera: hay que resolver como sigue
  const ventaYaRegistrada =
    fase === "pago-no-registrado" || fase === "comprobante-pendiente";
  const sePuedeCerrar = fase === "resumen" || fase === "error";
  const mostrarResumen =
    fase === "resumen" || fase === "enviando" || fase === "error";

  return (
    <Dialog
      open
      onOpenChange={(abierto) => !abierto && sePuedeCerrar && onCerrar()}
    >
      <DialogContent aria-describedby="descripcion-resumen-deuda">
        <DialogHeader>
          <DialogTitle>
            {ventaYaRegistrada
              ? "La venta ya quedó registrada"
              : fase === "venta-incierta"
                ? "No pudimos confirmar la venta"
                : "Confirmar venta con deuda"}
          </DialogTitle>
          <DialogDescription id="descripcion-resumen-deuda">
            {mostrarResumen
              ? "Revisá los datos: después de registrarla, la deuda se cobra desde Deudores."
              : "Lo que sigue depende de cómo quedó el registro."}
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          {mostrarResumen && (
            <dl className="flex flex-col gap-interno text-cuerpo">
              <FilaResumen
                etiqueta="Importe de la venta"
                dato={formatearMoneda(resumen.importeVenta)}
              />
              <FilaResumen
                etiqueta="Paga ahora"
                dato={formatearMoneda(resumen.cobradoAhora)}
              />
              <div className="border-t pt-interno">
                <FilaResumen
                  etiqueta="Queda debiendo"
                  dato={formatearMoneda(resumen.queDebe)}
                  destacada
                />
              </div>
              <div className="flex flex-col gap-interno border-t pt-interno">
                <FilaResumen
                  etiqueta="Deudor"
                  dato={deuda?.deudorElegido?.nombreCompleto ?? "—"}
                />
                <FilaResumen
                  etiqueta="Fecha estimada de pago"
                  dato={
                    deuda?.fechaEstimada?.modo === "fecha"
                      ? describirFechaEstimada(deuda.fechaEstimada.fecha)
                      : describirFechaEstimada(null)
                  }
                />
              </div>
            </dl>
          )}

          {/* Solo con pago inicial: el pago es un cobro y los cobros no se anulan, asi que el fiado queda firme */}
          {mostrarResumen && resumen.cobradoAhora > 0 && (
            <Alert>
              <TriangleAlert aria-hidden="true" />
              <AlertDescription>
                Una vez registrado el pago, este fiado ya no se puede anular.
              </AlertDescription>
            </Alert>
          )}

          {(fase === "venta-incierta" ||
            fase === "pago-no-registrado" ||
            fase === "comprobante-pendiente") && (
            <Alert variant="destructive">
              <TriangleAlert aria-hidden="true" />
              <AlertDescription>
                <p>{estadoConfirmacion.mensaje}</p>
              </AlertDescription>
            </Alert>
          )}

          {estadoConfirmacion.fase === "error" && (
            <Alert variant="destructive">
              <TriangleAlert aria-hidden="true" />
              <AlertTitle>
                {deudorInexistente
                  ? "El deudor ya no existe"
                  : "No se registró la venta"}
              </AlertTitle>
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
          {fase === "venta-incierta" && (
            <Button type="button" onClick={onAbandonarVentaIncierta}>
              Entendido
            </Button>
          )}
          {fase === "pago-no-registrado" && (
            <>
              <Button
                type="button"
                variant="outline"
                className="bg-fondo-tarjeta"
                onClick={onContinuarSinPagoInicial}
              >
                Seguir sin el pago
              </Button>
              {estadoConfirmacion.reintentable && (
                <Button type="button" onClick={onConfirmar}>
                  Reintentar el pago
                </Button>
              )}
            </>
          )}
          {fase === "comprobante-pendiente" && (
            <Button type="button" onClick={onConfirmar}>
              Reintentar
            </Button>
          )}
          {mostrarResumen && (
            <>
              <Button
                type="button"
                variant="outline"
                className="bg-fondo-tarjeta"
                disabled={enviando}
                onClick={onCerrar}
              >
                Volver
              </Button>
              <Button
                type="button"
                disabled={enviando || deudorInexistente}
                onClick={onConfirmar}
              >
                {enviando && (
                  <Loader2
                    aria-hidden="true"
                    className="animate-spin motion-reduce:animate-none"
                  />
                )}
                {enviando ? "Registrando…" : "Registrar venta"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
