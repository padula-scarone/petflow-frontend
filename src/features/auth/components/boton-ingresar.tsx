import { LoaderCircle, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Props del boton que envia el formulario de inicio de sesion. */
interface BotonIngresarProps {
  enviando: boolean
}

export function BotonIngresar({ enviando }: BotonIngresarProps) {
  return (
    // Deshabilitado mientras envia: frena el doble tap y tambien el Enter del formulario
    <Button
      type="submit"
      size="lg"
      className="w-full tracking-wide"
      disabled={enviando}
    >
      {enviando ? (
        <>
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
          INGRESANDO...
        </>
      ) : (
        <>
          INGRESAR
          <LogIn aria-hidden="true" className="size-5" />
        </>
      )}
    </Button>
  )
}
