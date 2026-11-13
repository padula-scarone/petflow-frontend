import { CreditCard } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { CampoMonto } from '@/features/ventas/components/campo-monto'
import { describirAjusteMedio } from '@/features/ventas/utils/describir-ajuste-medio'
import type { MedioPago } from '@/features/ventas/types/cobro'

/** Props de la grilla de medios de pago del pago unico. */
interface GrillaMediosPagoProps {
  medios: MedioPago[]
  idMedioSeleccionado: number | null
  pagaCon: number | null
  vuelto: number | null
  onSeleccionarMedioPago: (idMedioPago: number) => void
  onCambiarPagaCon: (monto: number | null) => void
}

export function GrillaMediosPago({
  medios,
  idMedioSeleccionado,
  pagaCon,
  vuelto,
  onSeleccionarMedioPago,
  onCambiarPagaCon,
}: GrillaMediosPagoProps) {
  const medioSeleccionado = medios.find((medio) => medio.idMedioPago === idMedioSeleccionado)

  return (
    <div className="flex flex-col gap-4">
      {/* --- MEDIOS --- */}
      <ToggleGroup
        type="single"
        spacing={3}
        aria-label="Medio de pago"
        className="grid w-full grid-cols-2 lg:grid-cols-4"
        value={idMedioSeleccionado === null ? '' : String(idMedioSeleccionado)}
        // Radix emite '' al des-seleccionar; en pago unico siempre debe haber un medio
        onValueChange={(valor) => {
          if (valor) onSeleccionarMedioPago(Number(valor))
        }}
      >
        {medios.map((medio) => {
          const Icono = medio.icono ?? CreditCard
          return (
            <ToggleGroupItem
              key={medio.idMedioPago}
              value={String(medio.idMedioPago)}
              className="h-auto min-h-24 w-full flex-col gap-1 rounded-grande border bg-fondo-tarjeta px-3 py-4"
            >
              <Icono className="size-6" />
              <span className="font-medium">{medio.nombre}</span>
              <span className="text-sm font-normal text-texto-suave tabular-nums">
                {describirAjusteMedio(medio)}
              </span>
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>

      {/* --- PAGA CON Y VUELTO (SOLO EFECTIVO) --- */}
      {medioSeleccionado?.admiteVuelto && (
        <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
          <CampoMonto
            idCampo="paga-con"
            etiqueta="Paga con"
            valor={pagaCon}
            onCambiar={onCambiarPagaCon}
          />
          <p className="flex flex-col">
            <span className="text-sm text-texto-suave">Vuelto</span>
            <span className="text-2xl font-bold tabular-nums">
              {formatearMoneda(vuelto ?? 0)}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
