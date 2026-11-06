import { Card } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { GrillaMediosPago } from '@/features/ventas/components/grilla-medios-pago'
import { ListaPagoMixto } from '@/features/ventas/components/lista-pago-mixto'
import { SelectorClienteFiado } from '@/features/ventas/components/selector-cliente-fiado'
import type {
  ClienteFiado,
  DatosNuevoCliente,
  EstadoCobro,
  FormaPago,
} from '@/features/ventas/types/cobro'

const CLASE_GRUPO = 'w-full rounded-grande border bg-fondo-tarjeta sm:w-fit'
const CLASE_OPCION = 'h-11 flex-1 px-5 sm:flex-none sm:min-w-28'

/** Props del panel donde se elige la forma de pago y se completa segun ella. */
interface PanelFormaPagoProps {
  estadoCobro: EstadoCobro
  textoBusquedaCliente: string
  resultadosBusquedaCliente: ClienteFiado[]
  onCambiarFormaPago: (formaPago: FormaPago) => void
  onSeleccionarMedioPago: (idMedioPago: string) => void
  onCambiarPagaCon: (monto: number | null) => void
  onAgregarLineaPago: (idMedioPago: string) => void
  onQuitarLineaPago: (idMedioPago: string) => void
  onCambiarMontoLinea: (idMedioPago: string, monto: number | null) => void
  onCambiarPagaConLinea: (idMedioPago: string, monto: number | null) => void
  onCompletarConRestante: (idMedioPago: string) => void
  onBuscarCliente: (textoBusqueda: string) => void
  onSeleccionarCliente: (idCliente: string) => void
  onQuitarCliente: () => void
  onCrearCliente: (datos: DatosNuevoCliente) => void
}

export function PanelFormaPago({
  estadoCobro,
  textoBusquedaCliente,
  resultadosBusquedaCliente,
  onCambiarFormaPago,
  onSeleccionarMedioPago,
  onCambiarPagaCon,
  onAgregarLineaPago,
  onQuitarLineaPago,
  onCambiarMontoLinea,
  onCambiarPagaConLinea,
  onCompletarConRestante,
  onBuscarCliente,
  onSeleccionarCliente,
  onQuitarCliente,
  onCrearCliente,
}: PanelFormaPagoProps) {
  const { formaPago } = estadoCobro

  return (
    <Card className="gap-4 p-4 shadow-none">
      {/* --- SELECTOR DE FORMA DE PAGO --- */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <span id="etiqueta-forma-pago" className="text-sm font-medium">
          Forma de pago:
        </span>
        <ToggleGroup
          type="single"
          aria-labelledby="etiqueta-forma-pago"
          className={CLASE_GRUPO}
          value={formaPago}
          // Radix emite '' al des-seleccionar; la forma de pago siempre debe tener valor
          onValueChange={(valor) => {
            if (valor) onCambiarFormaPago(valor as FormaPago)
          }}
        >
          <ToggleGroupItem value="unico" className={CLASE_OPCION}>
            Único
          </ToggleGroupItem>
          <ToggleGroupItem value="mixto" className={CLASE_OPCION}>
            Mixto
          </ToggleGroupItem>
          <ToggleGroupItem value="fiado" className={CLASE_OPCION}>
            Fiado
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* --- CONTENIDO SEGUN LA FORMA DE PAGO --- */}
      {formaPago === 'unico' && (
        <GrillaMediosPago
          medios={estadoCobro.mediosDisponibles}
          idMedioSeleccionado={estadoCobro.idMedioSeleccionado}
          pagaCon={estadoCobro.pagaCon}
          vuelto={estadoCobro.vuelto}
          onSeleccionarMedioPago={onSeleccionarMedioPago}
          onCambiarPagaCon={onCambiarPagaCon}
        />
      )}
      {formaPago === 'mixto' && (
        <ListaPagoMixto
          lineas={estadoCobro.lineasPagoMixto}
          mediosDisponibles={estadoCobro.mediosDisponibles}
          faltaCubrir={estadoCobro.resumen.faltaCubrir}
          onAgregarLineaPago={onAgregarLineaPago}
          onQuitarLineaPago={onQuitarLineaPago}
          onCambiarMontoLinea={onCambiarMontoLinea}
          onCambiarPagaConLinea={onCambiarPagaConLinea}
          onCompletarConRestante={onCompletarConRestante}
        />
      )}
      {formaPago === 'fiado' && (
        <SelectorClienteFiado
          clienteFiado={estadoCobro.clienteFiado}
          textoBusqueda={textoBusquedaCliente}
          resultadosBusqueda={resultadosBusquedaCliente}
          onBuscarCliente={onBuscarCliente}
          onSeleccionarCliente={onSeleccionarCliente}
          onQuitarCliente={onQuitarCliente}
          onCrearCliente={onCrearCliente}
        />
      )}
    </Card>
  )
}
