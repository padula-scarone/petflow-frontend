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
import { DetalleConfirmacionVenta } from "@/features/ventas/components/detalle-confirmacion-venta";
import { EstadoEnvioCobro } from "@/features/ventas/components/estado-envio-cobro";
import { FilaDetalleConfirmacion } from "@/features/ventas/components/fila-detalle-confirmacion";
import type {
  EstadoConfirmacionConDeuda,
  EstadoPagoConDeuda,
} from "@/features/ventas/deudores/types/pago-con-deuda";
import { describirFechaEstimada } from "@/features/ventas/deudores/utils/fechas-estimadas";
import type { ResumenConfirmacionVenta } from "@/features/ventas/types/resumen-confirmacion-venta";

/** Props del resumen que se confirma antes de registrar una venta, sea de contado, mixta o con deuda. */
interface DialogoResumenVentaConDeudaProps {
  estadoPago: EstadoPagoConDeuda;
  estadoConfirmacion: EstadoConfirmacionConDeuda;
  /** Todo lo que se revisa antes de registrar: productos, entrega, descuento y medios de pago. */
  resumenConfirmacion: ResumenConfirmacionVenta;
  onCerrar: () => void;
  onConfirmar: () => void;
  /** Tras un 404: vuelve al bloque Deuda para elegir a otra persona. */
  onCambiarDeudor: () => void;
  /** Con el pago inicial sin registrar: sigue con la venta como deuda total. */
  onContinuarSinPagoInicial: () => void;
  /** Con la venta incierta: descarta la venta en curso. */
  onAbandonarVentaIncierta: () => void;
}

/**
 * La confirmacion definitiva antes de registrar cualquier venta: todos sus datos de un vistazo y, con deuda, a quien
 * se le fia y para cuando. Una venta registrada no se edita (solo se anula dentro de los 15 minutos), asi que este es
 * el momento de corregir: "Volver y corregir" deja el carrito y el cobro como estaban.
 */
export function DialogoResumenVentaConDeuda({
  estadoPago,
  estadoConfirmacion,
  resumenConfirmacion,
  onCerrar,
  onConfirmar,
  onCambiarDeudor,
  onContinuarSinPagoInicial,
  onAbandonarVentaIncierta,
}: DialogoResumenVentaConDeudaProps) {
  const { resumen, deuda } = estadoPago;
  const { fase } = estadoConfirmacion;
  const enviando = fase === "enviando";
  const conDeuda = resumen.queDebe > 0;
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
      {/* En celular todo el dialogo scrollea, botones incluidos: se lee el detalle hasta el total antes de poder
          confirmar, y los botones no tapan nada. Desde sm es el dialogo de siempre, con el pie fijo */}
      <DialogContent
        className="max-sm:overflow-y-auto"
        aria-describedby="descripcion-resumen-deuda"
      >
        <DialogHeader>
          <DialogTitle>
            {ventaYaRegistrada
              ? "La venta ya quedó registrada"
              : fase === "venta-incierta"
                ? "No pudimos confirmar la venta"
                : conDeuda
                  ? "Confirmar venta con deuda"
                  : "Confirmar venta"}
          </DialogTitle>
          <DialogDescription id="descripcion-resumen-deuda">
            {mostrarResumen
              ? `Revisá los datos antes de registrarla. Una venta registrada no se edita: solo se puede anular dentro de los 15 minutos.${
                  conDeuda ? " La deuda se cobra desde Deudores." : ""
                }`
              : "Lo que sigue depende de cómo quedó el registro."}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="max-sm:flex-none max-sm:overflow-visible">
          {mostrarResumen && (
            <DetalleConfirmacionVenta resumen={resumenConfirmacion}>
              {conDeuda ? (
                <>
                  <FilaDetalleConfirmacion
                    etiqueta="Importe de la venta"
                    dato={formatearMoneda(resumen.importeVenta)}
                  />
                  <FilaDetalleConfirmacion
                    etiqueta="Paga ahora"
                    dato={formatearMoneda(resumen.cobradoAhora)}
                  />
                  <FilaDetalleConfirmacion
                    etiqueta="Queda debiendo"
                    dato={formatearMoneda(resumen.queDebe)}
                    destacada
                  />
                  {/* El deudor y la fecha dependen de la deuda: van corridos debajo de ella */}
                  <FilaDetalleConfirmacion
                    etiqueta="Deudor"
                    dato={deuda?.deudorElegido?.nombreCompleto ?? "—"}
                    sangria
                  />
                  <FilaDetalleConfirmacion
                    etiqueta="Fecha estimada de pago"
                    dato={
                      deuda?.fechaEstimada?.modo === "fecha"
                        ? describirFechaEstimada(deuda.fechaEstimada.fecha)
                        : describirFechaEstimada(null)
                    }
                    sangria
                  />
                </>
              ) : (
                <FilaDetalleConfirmacion
                  etiqueta="Total a cobrar"
                  dato={formatearMoneda(resumen.cobradoAhora)}
                  destacada
                />
              )}
            </DetalleConfirmacionVenta>
          )}

          {/* Una venta de contado viaja de una sola vez: la barra avisa que sigue en camino */}
          {estadoConfirmacion.fase === "enviando" &&
            estadoConfirmacion.segundosTranscurridos !== undefined && (
              <EstadoEnvioCobro
                estadoEnvio={{
                  fase: "enviando",
                  segundosTranscurridos: estadoConfirmacion.segundosTranscurridos,
                }}
              />
            )}

          {/* Solo con pago inicial: el pago es un cobro y los cobros no se anulan, asi que el fiado queda firme */}
          {mostrarResumen && conDeuda && resumen.cobradoAhora > 0 && (
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
                Volver y corregir
              </Button>
              <Button
                type="button"
                variant={conDeuda ? "default" : "exito"}
                disabled={enviando || deudorInexistente}
                onClick={onConfirmar}
              >
                {enviando && (
                  <Loader2
                    aria-hidden="true"
                    className="animate-spin motion-reduce:animate-none"
                  />
                )}
                {enviando ? "Registrando…" : "Confirmar venta"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
