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

/** Props del menu doble: modulos (primer nivel) y secciones (segundo nivel). */
export interface MenuDobleProps {
  modulos: ModuloMenu[]
  idModuloActivo: string
  idSeccionActiva: string
  nombreUsuario: string
  onSeleccionarModulo: (idModulo: string) => void
  onSeleccionarSeccion: (idSeccion: string) => void
  onAbrirMenuUsuario: () => void
  /** Identifica la pantalla mostrada; al cambiar, el contenido vuelve a su inicio en lugar de conservar el scroll. */
  claveContenido?: string
  /** Contenido de la pantalla activa, que se renderiza dentro del marco del menu. */
  children: ReactNode
}
