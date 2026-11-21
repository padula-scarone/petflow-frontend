import { cn } from '@/lib/utils'
import { obtenerIniciales } from '@/features/navegacion/utils/obtener-iniciales'

/** Props del circulo que identifica al usuario. */
interface AvatarUsuarioProps {
  nombre: string
  /** Foto de perfil. Mientras no exista (null o ausente) se muestran las iniciales. */
  urlFoto?: string | null
  className?: string
}

/**
 * Circulo con la foto del usuario o, si no tiene, sus iniciales sobre el violeta de la marca. Es decorativo: quien
 * lo usa dice el nombre (en el aria-label del boton o en texto al lado).
 */
export function AvatarUsuario({ nombre, urlFoto, className }: AvatarUsuarioProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-control shrink-0 items-center justify-center overflow-hidden rounded-full bg-primario text-cuerpo font-bold text-texto-sobre-primario select-none',
        className,
      )}
    >
      {urlFoto ? <img src={urlFoto} alt="" className="size-full object-cover" /> : obtenerIniciales(nombre)}
    </span>
  )
}
