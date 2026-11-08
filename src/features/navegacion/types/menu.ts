import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

/** Pestana de segundo nivel dentro de un modulo. */
export interface SeccionMenu {
  idSeccion: string
  etiqueta: string
}

/** Entrada de primer nivel del menu, con las secciones que contiene. */
export interface ModuloMenu {
  idModulo: string
  etiqueta: string
  icono: LucideIcon
  secciones: SeccionMenu[]
}

/** Lado desde el que se despliega el menu de usuario respecto de su boton. */
export type LadoMenuUsuario = 'top' | 'bottom'

/** Borde del boton con el que se alinea el menu de usuario. */
export type AlineacionMenuUsuario = 'start' | 'end'

/** Props del menu de usuario: boton con el nombre y menu desplegable. */
export interface MenuUsuarioProps {
  nombreUsuario: string
  /** Escritorio: 'top' (el boton esta al pie). Mobile: 'bottom' (el boton esta arriba). */
  ladoMenu: LadoMenuUsuario
  alineacionMenu: AlineacionMenuUsuario
  /** El boton ocupa todo el ancho de su contenedor y el menu iguala ese ancho (barra lateral). */
  anchoCompleto?: boolean
  /** Sin confirmacion: se dispara de inmediato. La sesion y la navegacion las resuelve quien lo recibe. */
  onCerrarSesion: () => void
}

/** Props del menu doble: modulos (primer nivel) y secciones (segundo nivel). */
export interface MenuDobleProps {
  modulos: ModuloMenu[]
  idModuloActivo: string
  idSeccionActiva: string
  nombreUsuario: string
  onSeleccionarModulo: (idModulo: string) => void
  onSeleccionarSeccion: (idSeccion: string) => void
  onCerrarSesion: () => void
  /** Identifica la pantalla mostrada; al cambiar, el contenido vuelve a su inicio en lugar de conservar el scroll. */
  claveContenido?: string
  /** Contenido de la pantalla activa, que se renderiza dentro del marco del menu. */
  children: ReactNode
}
