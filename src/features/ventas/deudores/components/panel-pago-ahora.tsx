import { NotebookPen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { BotonFiarTodo } from '@/features/ventas/deudores/components/boton-fiar-todo'
import { CampoMonto } from '@/features/ventas/components/campo-monto'
import { GrillaMediosPago } from '@/features/ventas/components/grilla-medios-pago'
import { ListaPagoMixto } from '@/features/ventas/components/lista-pago-mixto'
import type {
  FormaPagoAhora,
  PropiedadesPagoConDeuda,
} from '@/features/ventas/deudores/types/pago-con-deuda'
import { CLASE_GRUPO_SELECTOR, CLASE_OPCION_SELECTOR } from '@/features/ventas/config/clases-selector-opciones'


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
      {/* --- ENCABEZADO: TITULO, FIAR TODO Y FORMA DE PAGO --- */}
      {/* Celular: titulo, selector y "Fiar todo" apilados. Desde sm: "Fiar todo" sube a la fila del titulo, a la derecha,
          y el selector queda debajo a todo el ancho, igual que en Canal y Entrega */}
      <div className="grid gap-interno sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <h2 className="text-titulo-seccion font-bold sm:col-start-1 sm:row-start-1">Medio de pago</h2>
        {/* Fiando todo no se cobra nada: Unico y Mixto no tienen nada que elegir y se ocultan */}
        {fiarTodo ? (
          <p className="flex items-center gap-2 font-medium sm:col-span-2 sm:row-start-2">
            <NotebookPen aria-hidden="true" className="size-4 shrink-0" />
            Toda la venta queda como deuda
          </p>
        ) : (
          <ToggleGroup
            type="single"
            aria-label="Forma de pago"
            className={cn(CLASE_GRUPO_SELECTOR, 'sm:col-span-2 sm:row-start-2')}
            value={formaPago}
            // Radix emite '' al des-seleccionar; la forma de pago siempre debe tener valor
            onValueChange={(valor) => {
              if (valor) onCambiarFormaPago(valor as FormaPagoAhora)
            }}
          >
            <ToggleGroupItem value="unico" className={CLASE_OPCION_SELECTOR}>
              Único
            </ToggleGroupItem>
            <ToggleGroupItem value="mixto" className={CLASE_OPCION_SELECTOR}>
              Mixto
            </ToggleGroupItem>
          </ToggleGroup>
        )}
        <BotonFiarTodo
          fiarTodo={fiarTodo}
          onFiarTodo={onFiarTodo}
          onCobrarAlgoAhora={onCobrarAlgoAhora}
          className="sm:col-start-2 sm:row-start-1"
        />
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
            montoPagaJusto={resumen.cobradoAhora}
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
