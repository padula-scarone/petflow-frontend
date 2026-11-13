import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

/** Props del estado de error del historial. */
interface EstadoErrorHistorialProps {
  mensaje: string
  onReintentar: () => void
}

export function EstadoErrorHistorial({ mensaje, onReintentar }: EstadoErrorHistorialProps) {
  return (
    <Alert variant="destructive" className="items-center">
      <TriangleAlert aria-hidden="true" />
      <AlertTitle>No se pudo cargar el historial</AlertTitle>
      <AlertDescription>
        <p>{mensaje}</p>
        <Button type="button" variant="outline" className="mt-2 h-11 bg-fondo-tarjeta px-6 text-texto-principal" onClick={onReintentar}>
          Reintentar
        </Button>
      </AlertDescription>
    </Alert>
  )
}
