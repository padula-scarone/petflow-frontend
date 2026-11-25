import { CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { convertirPesosACentavos } from '@/features/ventas/utils/calcular-centavos'
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
  /** false en una devolución: el saldo se cobra sin el recargo o descuento del medio, asi que no se muestra. */
  mostrarAjustes?: boolean
  /** Lo que se cobra con el medio, con su ajuste: lo ofrece "Paga justo". Sin este dato el atajo no se muestra. */
  montoPagaJusto?: number
}

export function GrillaMediosPago({
  medios,
  idMedioSeleccionado,
  pagaCon,
  vuelto,
  onSeleccionarMedioPago,
  onCambiarPagaCon,
  mostrarAjustes = true,
  montoPagaJusto,
}: GrillaMediosPagoProps) {
  const medioSeleccionado = medios.find((medio) => medio.idMedioPago === idMedioSeleccionado)

  return (
    <div className="flex flex-col gap-bloque">
      {/* --- MEDIOS --- */}
      <ToggleGroup
        type="single"
        spacing={3}
        aria-label="Medio de pago"
        // items-stretch: el grupo trae items-center, y con el cada tarjeta conserva su alto; una con el nombre en tres
        // lineas (Transferencia) salia mas alta que las demas
        className="grid w-full grid-cols-2 items-stretch lg:grid-cols-4"
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
              className="h-auto min-h-24 w-full flex-col gap-1 rounded-grande border border-borde-campo bg-fondo-tarjeta p-contorno whitespace-normal"
            >
              <Icono className="size-6" />
              <span className="text-center font-medium wrap-break-word">{medio.nombre}</span>
              {mostrarAjustes && (
                <span className="text-cuerpo font-normal text-texto-suave tabular-nums">
                  {describirAjusteMedio(medio)}
                </span>
              )}
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>

      {/* --- PAGA CON Y VUELTO (SOLO EFECTIVO) --- */}
      {medioSeleccionado?.admiteVuelto && (
        // gap-y-1: el atajo queda pegado al campo, como "Sumar el restante". En celular el vuelto baja con su propio aire
        <div className="grid gap-x-bloque gap-y-1 sm:grid-cols-2 sm:items-end">
          <CampoMonto
            idCampo="paga-con"
            etiqueta="Paga con"
            valor={pagaCon}
            onCambiar={onCambiarPagaCon}
          />
          {/* El atajo sobra cuando el campo ya tiene ese monto (recien apretado o escrito a mano); vuelve al cambiarlo o vaciarlo */}
          {montoPagaJusto !== undefined &&
            montoPagaJusto > 0 &&
            (pagaCon === null || convertirPesosACentavos(pagaCon) !== convertirPesosACentavos(montoPagaJusto)) && (
            <Button
              type="button"
              variant="outline"
              className="self-start bg-fondo-tarjeta text-cuerpo tabular-nums sm:col-start-1 sm:row-start-2"
              onClick={() => onCambiarPagaCon(montoPagaJusto)}
            >
              Paga justo ({formatearMoneda(montoPagaJusto)})
            </Button>
          )}
          <p className="mt-3 flex items-baseline justify-between gap-interno sm:col-start-2 sm:row-start-1 sm:mt-0">
            <span className="text-cuerpo text-texto-suave">Vuelto</span>
            <span className="text-cifra-secundaria font-bold tabular-nums">
              {formatearMoneda(vuelto ?? 0)}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
