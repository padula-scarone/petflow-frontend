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

/** Props del dialogo que pide confirmar el descarte de una devolución a medio cargar. */
interface DialogoDescartarDevolucionProps {
  abierto: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export function DialogoDescartarDevolucion({ abierto, onConfirmar, onCancelar }: DialogoDescartarDevolucionProps) {
  return (
    <AlertDialog open={abierto} onOpenChange={(estaAbierto) => !estaAbierto && onCancelar()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Descartar la devolución?</AlertDialogTitle>
          <AlertDialogDescription>
            Se pierde lo que cargaste hasta ahora. Todavía no se registró nada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Seguir cargando</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirmar}>
            Sí, descartar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
