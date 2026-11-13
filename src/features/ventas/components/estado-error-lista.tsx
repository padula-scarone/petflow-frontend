import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

/** Props del estado de error de una lista. */
interface EstadoErrorListaProps {
  /** Por ejemplo "No se pudo cargar el historial". */
  titulo: string
  mensaje: string
  onReintentar: () => void
}

export function EstadoErrorLista({ titulo, mensaje, onReintentar }: EstadoErrorListaProps) {
  return (
    <Alert variant="destructive" className="items-center">
      <TriangleAlert aria-hidden="true" />
      <AlertTitle>{titulo}</AlertTitle>
      <AlertDescription>
        <p>{mensaje}</p>
        <Button type="button" variant="outline" className="mt-2 h-11 bg-fondo-tarjeta px-6 text-texto-principal" onClick={onReintentar}>
          Reintentar
        </Button>
      </AlertDescription>
    </Alert>
  )
}
