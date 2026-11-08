import { useEffect, useRef } from 'react'
import { BarraInferiorModulos } from '@/features/navegacion/components/barra-inferior-modulos'
import { BarraLateralModulos } from '@/features/navegacion/components/barra-lateral-modulos'
import { MenuUsuario } from '@/features/navegacion/components/menu-usuario'
import { PestanasSecciones } from '@/features/navegacion/components/pestanas-secciones'
import type { MenuDobleProps } from '@/features/navegacion/types/menu'

export function MenuDoble({
  modulos,
  idModuloActivo,
  idSeccionActiva,
  nombreUsuario,
  onSeleccionarModulo,
  onSeleccionarSeccion,
  onCerrarSesion,
  claveContenido = '',
  children,
}: MenuDobleProps) {
  const contenidoRef = useRef<HTMLElement>(null)
  const seccionesDelModulo =
    modulos.find((modulo) => modulo.idModulo === idModuloActivo)?.secciones ?? []

  // Al cambiar de modulo, de seccion o de pantalla el contenido vuelve a su inicio. Se mueve el
  // scroll en lugar de cambiar la key: remontar el contenido destruiria el estado de las rutas hijas
  useEffect(() => {
    contenidoRef.current?.scrollTo({ top: 0 })
  }, [idModuloActivo, idSeccionActiva, claveContenido])

  return (
    // La pantalla ocupa exactamente el alto visible: solo el contenido hace scroll
    <div className="flex h-dvh flex-col overflow-hidden bg-fondo-pagina">
      {/* --- BARRA LATERAL (ESCRITORIO) --- */}
      <BarraLateralModulos
        modulos={modulos}
        idModuloActivo={idModuloActivo}
        nombreUsuario={nombreUsuario}
        onSeleccionarModulo={onSeleccionarModulo}
        onCerrarSesion={onCerrarSesion}
      />

      {/* --- CABECERA: LOGO Y USUARIO (MOBILE) + SECCIONES --- */}
      <header className="flex shrink-0 flex-col lg:ml-60 lg:h-[73px] lg:justify-center">
        <div className="flex items-center justify-between gap-3 border-b bg-fondo-tarjeta px-4 py-3 lg:hidden">
          <p className="text-2xl font-bold">PetFlow</p>
          {/* El menu sale hacia abajo y se alinea al borde derecho del boton */}
          <MenuUsuario
            nombreUsuario={nombreUsuario}
            ladoMenu="bottom"
            alineacionMenu="end"
            onCerrarSesion={onCerrarSesion}
          />
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
      <main
        ref={contenidoRef}
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
