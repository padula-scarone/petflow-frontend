import { cn } from '@/lib/utils'
import type { ModuloMenu } from '@/features/navegacion/types/menu'

/** Props de la barra inferior de modulos (solo mobile). */
interface BarraInferiorModulosProps {
  modulos: ModuloMenu[]
  idModuloActivo: string
  onSeleccionarModulo: (idModulo: string) => void
}

export function BarraInferiorModulos({
  modulos,
  idModuloActivo,
  onSeleccionarModulo,
}: BarraInferiorModulosProps) {
  return (
    <nav
      aria-label="Modulos"
      className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t bg-card lg:hidden"
    >
      {modulos.map((modulo) => {
        const Icono = modulo.icono
        const activo = modulo.idModulo === idModuloActivo
        return (
          <button
            key={modulo.idModulo}
            type="button"
            aria-current={activo ? 'page' : undefined}
            className="flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 text-xs outline-none focus-visible:bg-primary-muted"
            onClick={() => onSeleccionarModulo(modulo.idModulo)}
          >
            <span
              className={cn(
                'flex h-7 w-14 items-center justify-center rounded-full',
                activo && 'bg-primary-muted',
              )}
            >
              <Icono aria-hidden="true" className="size-5" />
            </span>
            <span className={cn(activo && 'font-medium')}>{modulo.etiqueta}</span>
          </button>
        )
      })}
    </nav>
  )
}
