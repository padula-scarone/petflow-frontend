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
      className="h-12 w-full px-3 text-base font-bold tracking-wide shadow-md"
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
