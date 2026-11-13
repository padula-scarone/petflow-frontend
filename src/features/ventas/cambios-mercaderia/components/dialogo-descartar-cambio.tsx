import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

/** Props del dialogo que pide confirmar el descarte de un cambio a medio cargar. */
interface DialogoDescartarCambioProps {
  abierto: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export function DialogoDescartarCambio({ abierto, onConfirmar, onCancelar }: DialogoDescartarCambioProps) {
  return (
    <AlertDialog open={abierto} onOpenChange={(estaAbierto) => !estaAbierto && onCancelar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Descartar el cambio?</AlertDialogTitle>
          <AlertDialogDescription>
            Se pierde lo que cargaste hasta ahora. Todavía no se registró nada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-11 px-6">Seguir cargando</AlertDialogCancel>
          <AlertDialogAction variant="destructive" className="h-11 px-6" onClick={onConfirmar}>
            Sí, descartar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
