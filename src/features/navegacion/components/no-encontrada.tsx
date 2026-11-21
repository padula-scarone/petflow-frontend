import { Button } from '@/components/ui/button'

interface NoEncontradaProps {
  onVolverAlInicio: () => void
}

/** Pantalla que se muestra ante cualquier ruta desconocida. */
export function NoEncontrada({ onVolverAlInicio }: NoEncontradaProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-bloque bg-fondo-pagina p-contorno text-center">
      <p className="text-decorativo font-bold">404</p>
      <h1 className="text-titulo-pagina font-bold">Página no encontrada</h1>
      <p className="text-texto-suave">La dirección que buscás no existe.</p>
      <Button type="button" size="lg" onClick={onVolverAlInicio}>
        Volver al inicio
      </Button>
    </div>
  )
}
