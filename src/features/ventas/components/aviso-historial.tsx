import { CircleCheck, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { AvisoHistorial as DatosAviso } from '@/features/ventas/types/historial'

/** Props del aviso de exito sobre la lista. */
interface AvisoHistorialProps {
  aviso: DatosAviso
  onCerrar: () => void
}

export function AvisoHistorial({ aviso, onCerrar }: AvisoHistorialProps) {
  return (
    // role="status": se anuncia sin interrumpir, a diferencia del role="alert" que trae Alert por defecto
    <Alert role="status" className="items-center border-exito bg-fondo-tarjeta">
      <CircleCheck aria-hidden="true" className="text-green-700" />
      <AlertDescription className="flex items-center justify-between gap-2 text-texto-tarjeta">
        <p>{aviso.mensaje}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Cerrar el aviso"
          className="-my-2 -mr-3 size-11 shrink-0"
          onClick={onCerrar}
        >
          <X />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
