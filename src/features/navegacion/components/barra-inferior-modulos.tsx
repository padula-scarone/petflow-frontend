import { cn } from '@/lib/utils'
import type { ModuloMenu } from '@/features/navegacion/types/menu'

/** Props de la barra inferior de modulos (solo mobile). */
interface BarraInferiorModulosProps {
  modulos: ModuloMenu[]
  idModuloActivo: string
  onSeleccionarModulo: (idModulo: string) => void
  /** false mientras se desplaza el contenido hacia abajo: la barra se esconde y libera su lugar. */
  visible: boolean
}

export function BarraInferiorModulos({
  modulos,
  idModuloActivo,
  onSeleccionarModulo,
  visible,
}: BarraInferiorModulosProps) {
  return (
    // La barra se esconde achicando su alto hasta 0 (y no solo desplazandola): asi el area de contenido y los pies
    // fijos de Ventas ocupan el lugar que queda libre, pegados al borde de la pantalla. El alto se anima con la fila
    // de la grilla (1fr a 0fr); el relleno va en la barra y no en este contenedor, que tiene que poder llegar a 0.
    // inert: oculta no recibe foco ni la lee un lector de pantalla
    <div
      inert={!visible}
      className={cn(
        'grid shrink-0 transition-[grid-template-rows] duration-200 motion-reduce:transition-none lg:hidden',
        visible ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <nav
          aria-label="Modulos"
          className="sin-barra-desplazamiento flex overflow-x-auto border-t bg-fondo-tarjeta py-interno"
        >
          {modulos.map((modulo) => {
            const Icono = modulo.icono
            const activo = modulo.idModulo === idModuloActivo
            return (
              <button
                key={modulo.idModulo}
                type="button"
                aria-current={activo ? 'page' : undefined}
                className="flex h-control min-w-control flex-auto flex-col items-center justify-center gap-1 px-1 text-menu outline-none focus-visible:bg-fondo-hover sm:flex-1"
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
      </div>
    </div>
  )
}
