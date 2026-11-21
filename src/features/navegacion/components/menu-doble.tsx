import { useEffect, useRef, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import { IndicadorCaja } from '@/features/caja/components/indicador-caja'
import { useBarrasDesplazables } from '@/features/navegacion/hooks/use-barras-desplazables'
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
  cajaAbierta,
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
  } = useBarrasDesplazables(contenidoRef)
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
        cajaAbierta={cajaAbierta}
        onSeleccionarModulo={onSeleccionarModulo}
        onAbrirMiPerfil={onAbrirMiPerfil}
        onCerrarSesion={onCerrarSesion}
      />

      {/* --- CABECERA DE ESCRITORIO: SOLO LAS SECCIONES, SIEMPRE A LA VISTA --- */}
      {/* El logo y el usuario viven en la barra lateral; en mobile la cabecera esta dentro del contenido */}
      <header className="hidden shrink-0 lg:ml-60 lg:flex lg:flex-col lg:pt-contorno">
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
        className="flex min-h-0 flex-1 flex-col overflow-y-auto p-contorno lg:ml-60"
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
            'sticky -top-contorno z-30 -mx-contorno -mt-contorno mb-contorno shrink-0 bg-fondo-pagina transition-transform duration-200 motion-reduce:transition-none lg:hidden',
            !cabeceraVisible && '-translate-y-full',
          )}
        >
          <div className="flex items-center justify-between gap-interno border-b bg-fondo-tarjeta p-contorno">
            {/* Logo con interlineado ajustado y el estado de la caja debajo, separado para que no se
                lea como parte del logo: 24 + 4 + 12 = 40 px, justo el alto del boton de usuario
                (un control), asi que la cabecera no crece */}
            <div className="flex shrink-0 flex-col gap-1">
              <p className="text-logo font-bold">PetFlow</p>
              <IndicadorCaja cajaAbierta={cajaAbierta} />
            </div>
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
            <div className="pt-contorno">
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
        visible={cabeceraVisible}
      />
    </div>
  )
}
