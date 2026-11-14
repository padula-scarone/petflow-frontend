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
  /** false en un cambio: el saldo se cobra sin el recargo o descuento del medio, asi que no se muestra. */
  mostrarAjustes?: boolean
}

export function GrillaMediosPago({
  medios,
  idMedioSeleccionado,
  pagaCon,
  vuelto,
  onSeleccionarMedioPago,
  onCambiarPagaCon,
  mostrarAjustes = true,
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
              // whitespace-normal: el boton base no corta lineas y un nombre largo ("Transferencia (demo)") se salia de la tarjeta
              className="h-auto min-h-24 w-full flex-col gap-1 rounded-grande border bg-fondo-tarjeta px-3 py-4 whitespace-normal"
            >
              <Icono className="size-6" />
              <span className="text-center font-medium wrap-break-word">{medio.nombre}</span>
              {mostrarAjustes && (
                <span className="text-sm font-normal text-texto-suave tabular-nums">
                  {describirAjusteMedio(medio)}
                </span>
              )}
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
