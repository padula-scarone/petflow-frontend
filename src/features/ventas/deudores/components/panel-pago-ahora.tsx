import { NotebookPen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { BotonFiarTodo } from '@/features/ventas/deudores/components/boton-fiar-todo'
import { CampoMonto } from '@/features/ventas/components/campo-monto'
import { GrillaMediosPago } from '@/features/ventas/components/grilla-medios-pago'
import { ListaPagoMixto } from '@/features/ventas/components/lista-pago-mixto'
import type {
  FormaPagoAhora,
  PropiedadesPagoConDeuda,
} from '@/features/ventas/deudores/types/pago-con-deuda'

const CLASE_GRUPO = 'w-full rounded-grande border border-borde-campo bg-fondo-tarjeta sm:w-fit'
const CLASE_OPCION = 'flex-1 px-4 sm:flex-none sm:min-w-28'

/** Props del panel donde se elige con que paga el cliente ahora. */
type PanelPagoAhoraProps = Pick<
  PropiedadesPagoConDeuda,
  | 'estadoPago'
  | 'onCambiarFormaPago'
  | 'onSeleccionarMedioPago'
  | 'onCambiarMontoAhora'
  | 'onCambiarPagaCon'
  | 'onFiarTodo'
  | 'onCobrarAlgoAhora'
  | 'onAgregarLineaPago'
  | 'onQuitarLineaPago'
  | 'onCambiarMontoLinea'
  | 'onCambiarPagaConLinea'
  | 'onCompletarConRestante'
>

/**
 * Panel de pago de una venta que puede quedar con deuda. Responde "con que paga ahora": Unico o Mixto, y lo que
 * no se paga queda como deuda. "Fiar todo" es la forma explicita de no pagar nada.
 */
export function PanelPagoAhora({
  estadoPago,
  onCambiarFormaPago,
  onSeleccionarMedioPago,
  onCambiarMontoAhora,
  onCambiarPagaCon,
  onFiarTodo,
  onCobrarAlgoAhora,
  onAgregarLineaPago,
  onQuitarLineaPago,
  onCambiarMontoLinea,
  onCambiarPagaConLinea,
  onCompletarConRestante,
}: PanelPagoAhoraProps) {
  const { formaPago, fiarTodo, resumen, errorMontoAhora } = estadoPago

  return (
    <Card className="gap-bloque p-contorno">
      {/* --- ENCABEZADO: FORMA DE PAGO Y FIAR TODO --- */}
      <div className="flex flex-col gap-interno">
        <h2 className="text-titulo-seccion font-bold">Medio de pago</h2>
        <div className="flex flex-col gap-interno sm:flex-row sm:items-center sm:justify-between">
          {/* Fiando todo no se cobra nada: Unico y Mixto no tienen nada que elegir y se ocultan */}
          {fiarTodo ? (
            <p className="flex items-center gap-2 font-medium">
              <NotebookPen aria-hidden="true" className="size-4 shrink-0" />
              Toda la venta queda como deuda
            </p>
          ) : (
            <ToggleGroup
              type="single"
              aria-label="Forma de pago"
              className={CLASE_GRUPO}
              value={formaPago}
              // Radix emite '' al des-seleccionar; la forma de pago siempre debe tener valor
              onValueChange={(valor) => {
                if (valor) onCambiarFormaPago(valor as FormaPagoAhora)
              }}
            >
              <ToggleGroupItem value="unico" className={CLASE_OPCION}>
                Único
              </ToggleGroupItem>
              <ToggleGroupItem value="mixto" className={CLASE_OPCION}>
                Mixto
              </ToggleGroupItem>
            </ToggleGroup>
          )}
          <BotonFiarTodo fiarTodo={fiarTodo} onFiarTodo={onFiarTodo} onCobrarAlgoAhora={onCobrarAlgoAhora} />
        </div>
      </div>

      {/* --- CONTENIDO --- */}
      {!fiarTodo && formaPago === 'unico' && (
        <div className="flex flex-col gap-bloque">
          <div className="flex flex-col gap-interno">
            <CampoMonto
              idCampo="monto-ahora"
              etiqueta="Cobrar ahora"
              valor={estadoPago.montoAhora}
              onCambiar={onCambiarMontoAhora}
            />
            {errorMontoAhora !== undefined && (
              <p role="alert" className="text-auxiliar font-medium text-peligro">
                {errorMontoAhora}
              </p>
            )}
          </div>
          <GrillaMediosPago
            medios={estadoPago.mediosDisponibles}
            idMedioSeleccionado={estadoPago.idMedioSeleccionado}
            pagaCon={estadoPago.pagaCon}
            vuelto={estadoPago.vuelto}
            onSeleccionarMedioPago={onSeleccionarMedioPago}
            onCambiarPagaCon={onCambiarPagaCon}
          />
        </div>
      )}

      {!fiarTodo && formaPago === 'mixto' && (
        <ListaPagoMixto
          lineas={estadoPago.lineasPagoMixto}
          mediosDisponibles={estadoPago.mediosDisponibles}
          faltaCubrir={resumen.queDebe}
          onAgregarLineaPago={onAgregarLineaPago}
          onQuitarLineaPago={onQuitarLineaPago}
          onCambiarMontoLinea={onCambiarMontoLinea}
          onCambiarPagaConLinea={onCambiarPagaConLinea}
          onCompletarConRestante={onCompletarConRestante}
        />
      )}
    </Card>
  )
}
