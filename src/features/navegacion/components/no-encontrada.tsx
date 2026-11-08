import { Button } from '@/components/ui/button'

interface NoEncontradaProps {
  onVolverAlInicio: () => void
}

/** Pantalla que se muestra ante cualquier ruta desconocida. */
export function NoEncontrada({ onVolverAlInicio }: NoEncontradaProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-fondo-pagina p-4 text-center">
      <p className="text-6xl font-bold">404</p>
      <h1 className="text-xl font-semibold">Página no encontrada</h1>
      <p className="text-texto-suave">La dirección que buscás no existe.</p>
      <Button type="button" className="h-11 px-6" onClick={onVolverAlInicio}>
        Volver al inicio
      </Button>
    </div>
  )
}
