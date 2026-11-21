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

/** Datos del usuario conectado que muestra el menu de usuario. */
export interface UsuarioMenu {
  nombre: string
  /** Nombre de usuario con el que inicia sesion. */
  username: string
  /** Rol ya descrito para mostrar, por ejemplo "Gerente". */
  rol: string
  /** Foto de perfil. El back todavia no la tiene: mientras falte se muestran las iniciales. */
  urlFoto?: string | null
}

/** Props del menu de usuario: circulo con foto o iniciales y menu desplegable. */
export interface MenuUsuarioProps {
  usuario: UsuarioMenu
  /** Lleva a la pantalla de perfil del usuario. */
  onAbrirMiPerfil: () => void
  /** Sin confirmacion: se dispara de inmediato. La sesion y la navegacion las resuelve quien lo recibe. */
  onCerrarSesion: () => void
}

/** Props del menu doble: modulos (primer nivel) y secciones (segundo nivel). */
export interface MenuDobleProps {
  modulos: ModuloMenu[]
  idModuloActivo: string
  idSeccionActiva: string
  usuario: UsuarioMenu
  /** Estado de la caja: un chip al lado del usuario, arriba a la derecha en celular y en PC. */
  cajaAbierta: boolean
  onSeleccionarModulo: (idModulo: string) => void
  onSeleccionarSeccion: (idSeccion: string) => void
  onAbrirMiPerfil: () => void
  onCerrarSesion: () => void
  /** Identifica la pantalla mostrada; al cambiar, el contenido vuelve a su inicio en lugar de conservar el scroll. */
  claveContenido?: string
  /** Contenido de la pantalla activa, que se renderiza dentro del marco del menu. */
  children: ReactNode
}
