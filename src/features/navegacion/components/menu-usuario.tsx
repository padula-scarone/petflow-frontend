import { LogOut, UserRound } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AvatarUsuario } from '@/features/navegacion/components/avatar-usuario'
import type { MenuUsuarioProps } from '@/features/navegacion/types/menu'

/**
 * Circulo del usuario con su menu, arriba a la derecha en celular y en PC. El circulo identifica de un vistazo; el
 * nombre, el usuario y el rol se ven al abrir el menu (en PC, el nombre tambien aparece al pasar el mouse).
 * La apertura la maneja el propio menu (es estado visual, sin reglas de negocio): Radix resuelve el teclado,
 * Escape, el toque afuera y la devolucion del foco.
 */
export function MenuUsuario({ usuario, onAbrirMiPerfil, onCerrarSesion }: MenuUsuarioProps) {
  return (
    <DropdownMenu>
      {/* --- BOTON --- */}
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Menú de ${usuario.nombre}`}
          title={usuario.nombre}
          className="shrink-0 rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-foco/50"
        >
          <AvatarUsuario nombre={usuario.nombre} urlFoto={usuario.urlFoto} />
        </button>
      </DropdownMenuTrigger>

      {/* --- MENU: QUIEN ESTA CONECTADO Y SUS ACCIONES --- */}
      <DropdownMenuContent side="bottom" align="end" className="min-w-56">
        <div className="flex items-center gap-interno px-3 py-2">
          <AvatarUsuario nombre={usuario.nombre} urlFoto={usuario.urlFoto} />
          <dl className="min-w-0 text-cuerpo">
            <dt className="sr-only">Nombre</dt>
            <dd className="truncate font-bold">{usuario.nombre}</dd>
            <div className="flex gap-1 text-auxiliar text-texto-suave">
              <dt>Usuario:</dt>
              <dd className="truncate">{usuario.username}</dd>
            </div>
            <div className="flex gap-1 text-auxiliar text-texto-suave">
              <dt>Rol:</dt>
              <dd>{usuario.rol}</dd>
            </div>
          </dl>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onAbrirMiPerfil}>
          <UserRound />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Al resaltarse se oscurece: text-peligro sobre fondo-hover no llega a 4,5:1 de contraste */}
        <DropdownMenuItem
          className="text-peligro data-highlighted:text-red-700"
          onSelect={onCerrarSesion}
        >
          <LogOut />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
