import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

/** Props del boton que cancela la venta tras pedir confirmacion. */
interface BotonCancelarVentaProps {
  etiqueta: string
  onCancelarVenta: () => void
}

export function BotonCancelarVenta({ etiqueta, onCancelarVenta }: BotonCancelarVentaProps) {
  return (
    // Radix maneja si el dialogo esta abierto, por eso la vista no necesita estado
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline" className="h-11 w-full bg-fondo-tarjeta">
          {etiqueta}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Cancelar la venta?</AlertDialogTitle>
          <AlertDialogDescription>
            Se descartan el carrito y los datos de cobro cargados. Esta acción no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-11">Seguir con la venta</AlertDialogCancel>
          <AlertDialogAction variant="destructive" className="h-11" onClick={onCancelarVenta}>
            Sí, cancelar venta
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
