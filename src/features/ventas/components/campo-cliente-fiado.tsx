import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** Props del campo donde se escribe el nombre del cliente deudor de un fiado. */
interface CampoClienteFiadoProps {
  nombreCliente: string
  onCambiarNombreCliente: (nombreCliente: string) => void
}

export function CampoClienteFiado({
  nombreCliente,
  onCambiarNombreCliente,
}: CampoClienteFiadoProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-texto-suave">
        El fiado no ingresa a la caja: queda como deuda del cliente hasta que la liquide.
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nombre-cliente-fiado" className="text-sm text-texto-suave">
          Nombre del cliente
        </Label>
        <Input
          id="nombre-cliente-fiado"
          type="text"
          required
          maxLength={80}
          autoComplete="off"
          className="h-11 bg-fondo-tarjeta"
          value={nombreCliente}
          onChange={(evento) => onCambiarNombreCliente(evento.target.value)}
        />
      </div>
    </div>
  )
}
