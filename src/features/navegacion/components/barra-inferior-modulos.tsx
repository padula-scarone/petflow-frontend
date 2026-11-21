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
      className="sin-barra-desplazamiento flex shrink-0 overflow-x-auto border-t bg-fondo-tarjeta py-interno lg:hidden"
    >
      {modulos.map((modulo) => {
        const Icono = modulo.icono
        const activo = modulo.idModulo === idModuloActivo
        return (
          <button
            key={modulo.idModulo}
            type="button"
            aria-current={activo ? 'page' : undefined}
            className="flex h-control min-w-control flex-auto flex-col items-center justify-center gap-1 px-0.5 text-auxiliar leading-none outline-none focus-visible:bg-fondo-hover sm:flex-1"
            onClick={() => onSeleccionarModulo(modulo.idModulo)}
          >
            <span
              className={cn(
                'flex h-6 w-11 items-center justify-center rounded-full sm:w-14',
                activo && 'bg-primario text-texto-sobre-primario',
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
