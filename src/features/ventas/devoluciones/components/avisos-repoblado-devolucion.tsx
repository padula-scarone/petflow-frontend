import { Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

/** Props de los avisos de lo que no se pudo repoblar al editar una devolución. */
interface AvisosRepobladoDevolucionProps {
  avisos: string[]
}

/** Lista lo que quedo sin cargar al reabrir el alta de una devolución editada; sin avisos no muestra nada. */
export function AvisosRepobladoDevolucion({ avisos }: AvisosRepobladoDevolucionProps) {
  if (avisos.length === 0) return null
  return (
    <Alert role="status" className="mb-4">
      <Info aria-hidden="true" />
      <AlertTitle>Revisá antes de confirmar</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4">
          {avisos.map((aviso) => (
            <li key={aviso}>{aviso}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
