import { Info, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DatosContactoDeudor } from '@/features/ventas/deudores/components/datos-contacto-deudor'
import type { Deudor } from '@/features/ventas/deudores/types/deudor'

/** Props de la tarjeta del deudor elegido para una venta con deuda. */
interface TarjetaDeudorElegidoProps {
  deudor: Deudor
  /** Verdadero si el alta devolvio 409 y se selecciono a quien ya tenia ese DNI. */
  avisoDniExistente: boolean
  onCambiarDeudor: () => void
}

/** El deudor elegido, con su DNI (sin telefono: esta pantalla esta a la vista en el mostrador), y un boton para cambiarlo. */
export function TarjetaDeudorElegido({ deudor, avisoDniExistente, onCambiarDeudor }: TarjetaDeudorElegidoProps) {
  return (
    <div className="flex flex-col gap-interno">
      <div className="flex flex-col gap-1 rounded-grande border p-contorno">
        {/* --- AVATAR, NOMBRE Y CAMBIAR --- */}
        <div className="flex items-center gap-interno">
          <span
            aria-hidden="true"
            className="flex size-control shrink-0 items-center justify-center rounded-full bg-fondo-seleccion"
          >
            <UserRound className="size-5" />
          </span>
          <p className="min-w-0 flex-1 truncate font-bold">{deudor.nombreCompleto}</p>
          <Button
            type="button"
            variant="outline"
            className="shrink-0 bg-fondo-tarjeta"
            aria-label={`Cambiar el deudor ${deudor.nombreCompleto}`}
            onClick={onCambiarDeudor}
          >
            Cambiar
          </Button>
        </div>
        {/* --- DNI --- */}
        {/* Debajo y con todo el ancho de la caja; desde sm se alinea con el nombre */}
        <DatosContactoDeudor
          dni={deudor.dni}
          className="text-cuerpo text-texto-suave sm:pl-[calc(var(--spacing-control)+var(--spacing-interno))]"
        />
      </div>
      {avisoDniExistente && (
        <p role="status" className="flex items-start gap-2 text-cuerpo text-texto-suave">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Ese DNI ya estaba registrado: se seleccionó a esta persona.
        </p>
      )}
    </div>
  )
}
