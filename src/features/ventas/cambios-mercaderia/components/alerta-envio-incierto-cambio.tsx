import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

/** Props del aviso de un alta cuyo resultado no se conoce. */
interface AlertaEnvioInciertoCambioProps {
  mensaje: string
  /** true mientras se consulta la lista para saber si el cambio se guardo. */
  verificando: boolean
  onVerificar: () => void
}

/**
 * Se envio el cambio pero no se supo la respuesta (sin red, tiempo agotado o error del servidor). No se
 * reenvia: se consulta la lista para ver si quedo guardado, y con la duda se pide revisarla antes de confirmar.
 */
export function AlertaEnvioInciertoCambio({ mensaje, verificando, onVerificar }: AlertaEnvioInciertoCambioProps) {
  return (
    <Alert role="alert">
      <TriangleAlert aria-hidden="true" />
      <AlertTitle>No sabemos si el cambio se guardó</AlertTitle>
      <AlertDescription>
        <p>{mensaje}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-2 h-11 bg-fondo-tarjeta px-6 text-texto-principal"
          disabled={verificando}
          onClick={onVerificar}
        >
          {verificando ? 'Verificando…' : 'Verificar de nuevo'}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
