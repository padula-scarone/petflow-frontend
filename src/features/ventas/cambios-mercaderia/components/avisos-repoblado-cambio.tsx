import { Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

/** Props de los avisos de lo que no se pudo repoblar al editar un cambio. */
interface AvisosRepobladoCambioProps {
  avisos: string[]
}

/** Lista lo que quedo sin cargar al reabrir el alta de un cambio editado; sin avisos no muestra nada. */
export function AvisosRepobladoCambio({ avisos }: AvisosRepobladoCambioProps) {
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
