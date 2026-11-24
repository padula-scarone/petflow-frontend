import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { BotonConfirmarCobro } from '@/features/ventas/components/boton-confirmar-cobro'
import { EstadoCobertura } from '@/features/ventas/components/estado-cobertura'
import { EstadoMediosPago } from '@/features/ventas/components/estado-medios-pago'
import { PanelFormaPago } from '@/features/ventas/components/panel-forma-pago'
import { PanelResumenCobroDeudor } from '@/features/ventas/deudores/components/panel-resumen-cobro-deudor'
import type { ErrorCobroDeudor, FilaFiadoSeleccionable } from '@/features/ventas/deudores/types/cobro-deudor'
import type { Deudor } from '@/features/ventas/deudores/types/deudor'
import type { PropiedadesCobroRegistrarVenta } from '@/features/ventas/types/cobro'

/** Props de la pantalla de cobro de los fiados tildados. */
interface CobroDeudorProps {
  deudor: Deudor
  filasACobrar: FilaFiadoSeleccionable[]
  /** Suma de lo que se abona a los fiados, antes de los ajustes de los medios. */
  totalACobrar: number
  /** El cobro de Registrar Venta, sin descuento manual ni fiado: de el salen los medios y su calculo. */
  propiedadesCobro: PropiedadesCobroRegistrarVenta
  enviando: boolean
  error: ErrorCobroDeudor | null
  onConfirmarCobro: () => void
  onVolverALaFicha: () => void
}

/** Titulo del aviso de rechazo, segun por que el servidor no cobro. */
function describirTituloRechazo(error: ErrorCobroDeudor) {
  switch (error.motivo) {
    case 'FIADO_NO_ENCONTRADO':
    case 'FIADO_NO_PENDIENTE':
      return 'Un fiado cambió'
    case 'MONTO_EXCEDE_FALTA':
      return 'Un monto supera lo que falta'
    case 'SIN_CAJA_ABIERTA':
      return 'No hay una caja abierta'
    case 'COBRO_SIMULTANEO':
      return 'Otro cobro está en curso'
    case 'RESULTADO_INCIERTO':
      return 'No pudimos confirmar el cobro'
    default:
      return 'No se pudo registrar el cobro'
  }
}

/**
 * Cobro de los fiados tildados en la ficha. Es una pantalla y no un dialogo, con la misma forma que el paso de pago
 * de Registrar Venta: a la izquierda que se cobra y con que medio, a la derecha el resumen. Sin descuento manual ni
 * Fiado (el SSOT no los admite al cobrar). Es todo o nada: si falla uno, no se cobra ninguno.
 */
export function CobroDeudor({
  deudor,
  filasACobrar,
  totalACobrar,
  propiedadesCobro,
  enviando,
  error,
  onConfirmarCobro,
  onVolverALaFicha,
}: CobroDeudorProps) {
  const { estadoCobro } = propiedadesCobro
  const { resumen, formaPago, puedeConfirmar } = estadoCobro
  // Si un fiado cambio o el monto ya no entra, no hay nada que reintentar: se vuelve a la ficha
  const puedeReintentar = error === null || error.reintentable

  return (
    <section className="flex min-h-full flex-col gap-bloque">
      {/* --- ENCABEZADO --- */}
      <header className="flex flex-col gap-interno">
        <Button type="button" variant="ghost" className="-ml-3 self-start" disabled={enviando} onClick={onVolverALaFicha}>
          <ArrowLeft aria-hidden="true" />
          Volver a la ficha
        </Button>
        <h1 className="text-titulo-pagina font-bold wrap-break-word">Cobrar a {deudor.nombreCompleto}</h1>
      </header>

      <div className="grid gap-bloque xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        {/* --- QUE SE COBRA Y CON QUE --- */}
        <div className="flex min-w-0 flex-col gap-bloque">
          <Card className="gap-interno p-contorno">
            <h2 className="text-titulo-seccion font-bold">Fiados a cobrar</h2>
            <ul className="flex flex-col gap-interno text-cuerpo">
              {filasACobrar.map((fila) => (
                <li key={fila.fiado.idVenta} className="flex justify-between gap-interno">
                  <span className="tabular-nums">{fila.fiado.numeroComprobante}</span>
                  <span className="font-medium whitespace-nowrap tabular-nums">
                    {formatearMoneda(fila.montoACobrar ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <EstadoMediosPago
            estadoMediosPago={propiedadesCobro.estadoMediosPago}
            cantidadMedios={estadoCobro.mediosDisponibles.length}
            onReintentar={propiedadesCobro.onReintentarMediosPago}
          />

          <PanelFormaPago
            estadoCobro={estadoCobro}
            permiteFiado={false}
            onCambiarFormaPago={propiedadesCobro.onCambiarFormaPago}
            onSeleccionarMedioPago={propiedadesCobro.onSeleccionarMedioPago}
            onCambiarPagaCon={propiedadesCobro.onCambiarPagaCon}
            onAgregarLineaPago={propiedadesCobro.onAgregarLineaPago}
            onQuitarLineaPago={propiedadesCobro.onQuitarLineaPago}
            onCambiarMontoLinea={propiedadesCobro.onCambiarMontoLinea}
            onCambiarPagaConLinea={propiedadesCobro.onCambiarPagaConLinea}
            onCompletarConRestante={propiedadesCobro.onCompletarConRestante}
            onCambiarNombreClienteFiado={propiedadesCobro.onCambiarNombreClienteFiado}
          />

          {/* --- RECHAZO DEL SERVIDOR (TODO O NADA) --- */}
          {error && (
            <Alert variant="destructive">
              <TriangleAlert aria-hidden="true" />
              <AlertTitle>{describirTituloRechazo(error)}</AlertTitle>
              <AlertDescription>
                <p>{error.mensaje}</p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* --- RESUMEN --- */}
        <PanelResumenCobroDeudor
          estadoCobro={estadoCobro}
          totalACobrar={totalACobrar}
          enviando={enviando}
          puedeReintentar={puedeReintentar}
          onConfirmarCobro={onConfirmarCobro}
          onVolverALaFicha={onVolverALaFicha}
          onAjustarMontosAutomaticamente={propiedadesCobro.onAjustarMontosAutomaticamente}
        />
      </div>

      {/* --- CANCELAR (MOBILE) --- */}
      {/* Al final del contenido, lejos del pulgar, como en Registrar Venta */}
      <div className="xl:hidden">
        <Button
          type="button"
          variant="outline"
          className="w-full bg-fondo-tarjeta"
          disabled={enviando}
          onClick={onVolverALaFicha}
        >
          {puedeReintentar ? 'Cancelar' : 'Volver a la ficha'}
        </Button>
      </div>

      {/* --- FOOTER CONFIRMAR (MOBILE) --- */}
      {puedeReintentar && (
        <footer className="sticky -bottom-contorno z-10 mt-auto -mx-contorno -mb-contorno flex flex-col gap-interno border-t bg-fondo-tarjeta p-contorno xl:hidden">
          {formaPago === 'mixto' && (
            <EstadoCobertura
              faltaCubrir={resumen.faltaCubrir}
              excedente={resumen.excedente}
              onAjustarAutomaticamente={propiedadesCobro.onAjustarMontosAutomaticamente}
            />
          )}
          <div className="flex items-center justify-between gap-interno">
            <p className="flex min-w-0 flex-col">
              <span className="text-cuerpo text-texto-suave">Total</span>
              <span className="text-cifra-secundaria font-bold tabular-nums">{formatearMoneda(resumen.total)}</span>
            </p>
            <BotonConfirmarCobro
              formaPago={formaPago}
              habilitado={puedeConfirmar && !enviando}
              enviando={enviando}
              onConfirmarCobro={onConfirmarCobro}
              className="flex-1 sm:flex-none"
            />
          </div>
        </footer>
      )}
    </section>
  )
}
