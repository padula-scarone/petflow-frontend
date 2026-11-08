import { ChevronDown, ChevronUp, LogOut, User, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { MenuUsuarioProps } from '@/features/navegacion/types/menu'

/**
 * Boton del usuario con su menu. La apertura la maneja el propio menu (es estado visual, sin reglas
 * de negocio): Radix resuelve el teclado, Escape, el toque afuera y la devolucion del foco.
 */
export function MenuUsuario({
  nombreUsuario,
  ladoMenu,
  alineacionMenu,
  anchoCompleto = false,
  onCerrarSesion,
}: MenuUsuarioProps) {
  // La flecha apunta hacia donde sale el menu
  const IconoDesplegable = ladoMenu === 'top' ? ChevronUp : ChevronDown

  return (
    <DropdownMenu>
      {/* --- BOTON --- */}
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={`Menú de ${nombreUsuario}`}
          className={cn('h-11 min-w-0 gap-2 rounded-full', anchoCompleto ? 'w-full gap-3' : 'px-5')}
        >
          <User />
          <span className="truncate">{nombreUsuario}</span>
          <IconoDesplegable aria-hidden="true" className={cn(anchoCompleto && 'ml-auto')} />
        </Button>
      </DropdownMenuTrigger>

      {/* --- MENU --- */}
      <DropdownMenuContent
        side={ladoMenu}
        align={alineacionMenu}
        className={
          anchoCompleto ? 'min-w-(--radix-dropdown-menu-trigger-width)' : 'min-w-56'
        }
      >
        {/* Sin pantalla en la Demo: deshabilitada para que no parezca un boton roto */}
        <DropdownMenuItem disabled>
          <UserRound />
          Mi perfil
          <span className="ml-auto text-xs">Próximamente</span>
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
