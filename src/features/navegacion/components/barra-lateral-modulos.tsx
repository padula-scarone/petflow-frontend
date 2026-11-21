import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ModuloMenu } from '@/features/navegacion/types/menu'

/** Props de la barra lateral de modulos (solo escritorio). */
interface BarraLateralModulosProps {
  modulos: ModuloMenu[]
  idModuloActivo: string
  onSeleccionarModulo: (idModulo: string) => void
}

export function BarraLateralModulos({
  modulos,
  idModuloActivo,
  onSeleccionarModulo,
}: BarraLateralModulosProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col gap-bloque border-r bg-fondo-tarjeta p-contorno lg:flex">
      {/* --- LOGO --- */}
      <p className="px-2 pt-1 text-center text-logo font-bold">PetFlow</p>

      {/* --- MODULOS --- */}
      <nav aria-label="Modulos" className="flex flex-1 flex-col gap-interno overflow-y-auto">
        {modulos.map((modulo) => {
          const Icono = modulo.icono
          const activo = modulo.idModulo === idModuloActivo
          return (
            <Button
              key={modulo.idModulo}
              type="button"
              variant="ghost"
              aria-current={activo ? 'page' : undefined}
              className={cn(
                'justify-start gap-interno rounded-full has-[>svg]:px-4',
                activo ? 'bg-primario text-texto-sobre-primario font-medium hover:bg-primario' : 'font-normal',
              )}
              onClick={() => onSeleccionarModulo(modulo.idModulo)}
            >
              <Icono />
              {modulo.etiqueta}
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}
