import { useEffect, useRef, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { useCabeceraDesplazable } from '@/features/navegacion/hooks/use-cabecera-desplazable'
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
  onAbrirMiPerfil,
  onCerrarSesion,
  claveContenido = '',
  children,
}: MenuDobleProps) {
  const contenidoRef = useRef<HTMLElement>(null)
  const {
    cabeceraRef,
    visible: cabeceraVisible,
    altoCabecera,
  } = useCabeceraDesplazable(contenidoRef)
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
        onAbrirMiPerfil={onAbrirMiPerfil}
        onCerrarSesion={onCerrarSesion}
      />

      {/* --- CABECERA DE ESCRITORIO: SOLO LAS SECCIONES, SIEMPRE A LA VISTA --- */}
      {/* El logo y el usuario viven en la barra lateral; en mobile la cabecera esta dentro del contenido */}
      <header className="hidden shrink-0 lg:ml-60 lg:flex lg:h-[73px] lg:flex-col lg:justify-center">
        {seccionesDelModulo.length > 0 && (
          <PestanasSecciones
            secciones={seccionesDelModulo}
            idSeccionActiva={idSeccionActiva}
            onSeleccionarSeccion={onSeleccionarSeccion}
          />
        )}
      </header>

      {/* --- CONTENIDO (UNICA ZONA CON SCROLL) --- */}
      <main
        ref={contenidoRef}
        // Las pantallas con elementos fijos arriba (como los filtros del Historial) se acomodan debajo
        // de la cabecera con esta variable: vale su alto mientras se ve y 0 cuando se oculta
        style={{ '--alto-cabecera': `${cabeceraVisible ? altoCabecera : 0}px` } as CSSProperties}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 lg:ml-60 xl:p-8"
      >
        {/* --- CABECERA DE MOBILE: LOGO, USUARIO Y SECCIONES --- */}
        {/* Va dentro del area con scroll y se oculta al bajar; reaparece apenas se sube un poco.
            Los margenes negativos la llevan de borde a borde, sobre el padding del contenido; el top
            negativo compensa ese padding (sticky se mide desde el borde interno).
            inert: oculta no recibe foco ni lee un lector de pantalla */}
        <div
          ref={cabeceraRef}
          inert={!cabeceraVisible}
          className={cn(
            'sticky -top-4 z-30 -mx-4 -mt-4 mb-5 shrink-0 bg-fondo-pagina transition-transform duration-200 motion-reduce:transition-none lg:hidden',
            !cabeceraVisible && '-translate-y-full',
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b bg-fondo-tarjeta px-4 py-3">
            <p className="text-2xl font-bold">PetFlow</p>
            {/* El menu sale hacia abajo y se alinea al borde derecho del boton */}
            <MenuUsuario
              nombreUsuario={nombreUsuario}
              ladoMenu="bottom"
              alineacionMenu="end"
              onAbrirMiPerfil={onAbrirMiPerfil}
              onCerrarSesion={onCerrarSesion}
            />
          </div>
          {seccionesDelModulo.length > 0 && (
            <div className="pt-3">
              <PestanasSecciones
                secciones={seccionesDelModulo}
                idSeccionActiva={idSeccionActiva}
                onSeleccionarSeccion={onSeleccionarSeccion}
              />
            </div>
          )}
        </div>

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
