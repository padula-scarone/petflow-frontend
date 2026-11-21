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
  usuario,
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
    // La pantalla ocupa exactamente el alto visible: solo el contenido hace scroll. relative: lo que esta posicionado
    // en absoluto (como los textos sr-only de las tablas) toma este contenedor como referencia; sin eso su
    // referencia es la ventana, el overflow-hidden no lo recorta y alarga el documento: aparece una segunda barra
    <div className="relative flex h-dvh flex-col overflow-hidden bg-fondo-pagina">
      {/* --- BARRA LATERAL (ESCRITORIO) --- */}
      <BarraLateralModulos
        modulos={modulos}
        idModuloActivo={idModuloActivo}
        onSeleccionarModulo={onSeleccionarModulo}
      />

      {/* --- CABECERA DE ESCRITORIO: SECCIONES, ESTADO DE LA CAJA Y USUARIO, SIEMPRE A LA VISTA --- */}
      {/* El logo vive en la barra lateral; la caja y el usuario van arriba a la derecha, en el mismo lugar que en
          celular. En mobile la cabecera esta dentro del contenido */}
      <header className="hidden shrink-0 lg:ml-60 lg:flex lg:items-center lg:pt-contorno lg:pr-contorno">
        <div className="min-w-0 flex-1">
          {seccionesDelModulo.length > 0 && (
            <PestanasSecciones
              secciones={seccionesDelModulo}
              idSeccionActiva={idSeccionActiva}
              onSeleccionarSeccion={onSeleccionarSeccion}
            />
          )}
        </div>
        <div className="flex shrink-0 items-center gap-interno">
          <IndicadorCaja cajaAbierta={cajaAbierta} />
          <MenuUsuario usuario={usuario} onAbrirMiPerfil={onAbrirMiPerfil} onCerrarSesion={onCerrarSesion} />
        </div>
      </header>

      {/* --- CONTENIDO (UNICA ZONA CON SCROLL) --- */}
      <main
        ref={contenidoRef}
        // Las pantallas con elementos fijos arriba (como los filtros del Historial) se acomodan debajo
        // de la cabecera con esta variable: vale su alto mientras se ve y 0 cuando se oculta
        style={{ '--alto-cabecera': `${cabeceraVisible ? altoCabecera : 0}px` } as CSSProperties}
        className="relative flex min-h-0 flex-1 flex-col overflow-y-auto p-contorno lg:ml-60"
      >
        {/* --- CABECERA DE MOBILE: LOGO, USUARIO Y SECCIONES --- */}
        {/* Va dentro del area con scroll y se oculta al bajar; reaparece apenas se sube un poco.
            Los margenes negativos la llevan de borde a borde, sobre el padding del contenido; el top
            negativo compensa ese padding (sticky se mide desde el borde interno).
            pb-contorno: el aire de abajo es de la cabecera y no un margen de afuera. Asi, al quedar fija, el contenido
            que pasa por debajo no roza las pestanas: lo cubre el fondo de la cabecera.
            inert: oculta no recibe foco ni lee un lector de pantalla */}
        <div
          ref={cabeceraRef}
          inert={!cabeceraVisible}
          className={cn(
            'sticky -top-contorno z-30 -mx-contorno -mt-contorno shrink-0 bg-fondo-pagina pb-contorno transition-transform duration-200 motion-reduce:transition-none lg:hidden',
            !cabeceraVisible && '-translate-y-full',
          )}
        >
          <div className="flex items-center justify-between gap-interno border-b bg-fondo-tarjeta p-contorno">
            <p className="shrink-0 text-logo font-bold">PetFlow</p>
            {/* El estado de la caja y el usuario juntos, igual que en PC: los dos son datos del puesto de trabajo */}
            <div className="flex min-w-0 items-center gap-interno">
              <IndicadorCaja cajaAbierta={cajaAbierta} />
              <MenuUsuario usuario={usuario} onAbrirMiPerfil={onAbrirMiPerfil} onCerrarSesion={onCerrarSesion} />
            </div>
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
