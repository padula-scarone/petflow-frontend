import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BarraInferiorModulos } from '@/features/navegacion/components/barra-inferior-modulos'
import { BarraLateralModulos } from '@/features/navegacion/components/barra-lateral-modulos'
import { PestanasSecciones } from '@/features/navegacion/components/pestanas-secciones'
import type { MenuDobleProps } from '@/features/navegacion/types/menu'

export function MenuDoble({
  modulos,
  idModuloActivo,
  idSeccionActiva,
  nombreUsuario,
  onSeleccionarModulo,
  onSeleccionarSeccion,
  onAbrirMenuUsuario,
  claveContenido = '',
  children,
}: MenuDobleProps) {
  const seccionesDelModulo =
    modulos.find((modulo) => modulo.idModulo === idModuloActivo)?.secciones ?? []

  return (
    // La pantalla ocupa exactamente el alto visible: solo el contenido hace scroll
    <div className="flex h-dvh flex-col overflow-hidden bg-fondo-pagina">
      {/* --- BARRA LATERAL (ESCRITORIO) --- */}
      <BarraLateralModulos
        modulos={modulos}
        idModuloActivo={idModuloActivo}
        nombreUsuario={nombreUsuario}
        onSeleccionarModulo={onSeleccionarModulo}
        onAbrirMenuUsuario={onAbrirMenuUsuario}
      />

      {/* --- CABECERA: LOGO Y USUARIO (MOBILE) + SECCIONES --- */}
      <header className="flex shrink-0 flex-col lg:ml-60 lg:h-[73px] lg:justify-center">
        <div className="flex items-center justify-between gap-3 border-b bg-fondo-tarjeta px-4 py-3 lg:hidden">
          <p className="text-2xl font-bold">PetFlow</p>
          <Button
            type="button"
            variant="outline"
            className="h-11 gap-2 rounded-full px-5"
            onClick={onAbrirMenuUsuario}
          >
            <User />
            {nombreUsuario}
          </Button>
        </div>
        {seccionesDelModulo.length > 0 && (
          <div className="px-4 py-3 lg:py-0">
            <PestanasSecciones
              secciones={seccionesDelModulo}
              idSeccionActiva={idSeccionActiva}
              onSeleccionarSeccion={onSeleccionarSeccion}
            />
          </div>
        )}
      </header>

      {/* --- CONTENIDO (UNICA ZONA CON SCROLL) --- */}
      {/* La key reinicia el scroll al cambiar de modulo, de seccion o de pantalla */}
      <main
        key={`${idModuloActivo}-${idSeccionActiva}-${claveContenido}`}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 lg:ml-60 xl:p-8"
      >
        {children}
      </main>

      {/* --- BARRA INFERIOR (MOBILE) --- */}
      <BarraInferiorModulos
        modulos={modulos}
        idModuloActivo={idModuloActivo}
        onSeleccionarModulo={onSeleccionarModulo}
      />
    </div>
  )
}
