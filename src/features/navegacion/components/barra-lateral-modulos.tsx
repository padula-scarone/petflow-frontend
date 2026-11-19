import { Button } from '@/components/ui/button'
import { IndicadorCaja } from '@/features/caja/components/indicador-caja'
import { MenuUsuario } from '@/features/navegacion/components/menu-usuario'
import { cn } from '@/lib/utils'
import type { ModuloMenu } from '@/features/navegacion/types/menu'

/** Props de la barra lateral de modulos (solo escritorio). */
interface BarraLateralModulosProps {
  modulos: ModuloMenu[]
  idModuloActivo: string
  nombreUsuario: string
  cajaAbierta: boolean
  onSeleccionarModulo: (idModulo: string) => void
  onAbrirMiPerfil: () => void
  onCerrarSesion: () => void
}

export function BarraLateralModulos({
  modulos,
  idModuloActivo,
  nombreUsuario,
  cajaAbierta,
  onSeleccionarModulo,
  onAbrirMiPerfil,
  onCerrarSesion,
}: BarraLateralModulosProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col gap-6 border-r bg-fondo-tarjeta p-4 lg:flex">
      {/* --- LOGO --- */}
      <p className="px-2 pt-1 text-center text-2xl font-bold">PetFlow</p>

      {/* --- MODULOS --- */}
      <nav aria-label="Modulos" className="flex flex-1 flex-col gap-2 overflow-y-auto">
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
                'h-11 justify-start gap-3 rounded-full px-4',
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

      {/* --- ESTADO DE LA CAJA Y USUARIO --- */}
      <div className="flex flex-col gap-3">
        {/* px-4 lo alinea con el icono del boton de usuario y con los de los modulos */}
        <IndicadorCaja cajaAbierta={cajaAbierta} className="px-4" />
        <MenuUsuario
          nombreUsuario={nombreUsuario}
          ladoMenu="top"
          alineacionMenu="start"
          anchoCompleto
          onAbrirMiPerfil={onAbrirMiPerfil}
          onCerrarSesion={onCerrarSesion}
        />
      </div>
    </aside>
  )
}
