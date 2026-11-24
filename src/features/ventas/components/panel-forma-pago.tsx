import { Card } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CampoClienteFiado } from '@/features/ventas/components/campo-cliente-fiado'
import { GrillaMediosPago } from '@/features/ventas/components/grilla-medios-pago'
import { ListaPagoMixto } from '@/features/ventas/components/lista-pago-mixto'
import type { EstadoCobro, FormaPago } from '@/features/ventas/types/cobro'
import { CLASE_GRUPO_SELECTOR, CLASE_OPCION_SELECTOR } from '@/features/ventas/config/clases-selector-opciones'


/** Props del panel donde se elige la forma de pago y se completa segun ella. */
interface PanelFormaPagoProps {
  estadoCobro: EstadoCobro
  onCambiarFormaPago: (formaPago: FormaPago) => void
  onSeleccionarMedioPago: (idMedioPago: number) => void
  onCambiarPagaCon: (monto: number | null) => void
  onAgregarLineaPago: (idMedioPago: number) => void
  onQuitarLineaPago: (idMedioPago: number) => void
  onCambiarMontoLinea: (idMedioPago: number, monto: number | null) => void
  onCambiarPagaConLinea: (idMedioPago: number, monto: number | null) => void
  onCompletarConRestante: (idMedioPago: number) => void
  onCambiarNombreClienteFiado: (nombreCliente: string) => void
  /** Falso al cobrar un fiado ya registrado: no se puede volver a fiar. */
  permiteFiado?: boolean
}

export function PanelFormaPago({
  estadoCobro,
  onCambiarFormaPago,
  onSeleccionarMedioPago,
  onCambiarPagaCon,
  onAgregarLineaPago,
  onQuitarLineaPago,
  onCambiarMontoLinea,
  onCambiarPagaConLinea,
  onCompletarConRestante,
  onCambiarNombreClienteFiado,
  permiteFiado = true,
}: PanelFormaPagoProps) {
  const { formaPago } = estadoCobro

  return (
    <Card className="gap-bloque p-contorno">
      {/* --- SELECTOR DE FORMA DE PAGO --- */}
      <div className="flex flex-col gap-interno">
        <h2 id="titulo-forma-pago" className="text-titulo-seccion font-bold">
          Forma de pago
        </h2>
        <ToggleGroup
          type="single"
          aria-labelledby="titulo-forma-pago"
          className={CLASE_GRUPO_SELECTOR}
          value={formaPago}
          // Radix emite '' al des-seleccionar; la forma de pago siempre debe tener valor
          onValueChange={(valor) => {
            if (valor) onCambiarFormaPago(valor as FormaPago)
          }}
        >
          <ToggleGroupItem value="unico" className={CLASE_OPCION_SELECTOR}>
            Único
          </ToggleGroupItem>
          <ToggleGroupItem value="mixto" className={CLASE_OPCION_SELECTOR}>
            Mixto
          </ToggleGroupItem>
          {permiteFiado && (
            <ToggleGroupItem value="fiado" className={CLASE_OPCION_SELECTOR}>
              Fiado
            </ToggleGroupItem>
          )}
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
        <CampoClienteFiado
          nombreCliente={estadoCobro.nombreClienteFiado}
          onCambiarNombreCliente={onCambiarNombreClienteFiado}
        />
      )}
    </Card>
  )
}
