import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LONGITUD_MAXIMA_USERNAME } from '@/features/auth/config/reglas-inicio-sesion'

/** Props del campo donde se escribe el nombre de usuario. */
interface CampoUsuarioProps {
  username: string
  /** Mientras se envia, el campo queda de solo lectura para que lo enviado sea lo que se ve. */
  enviando: boolean
  error?: string
  onCambiarUsername: (username: string) => void
}

export function CampoUsuario({ username, enviando, error, onCambiarUsername }: CampoUsuarioProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="campo-username" className="text-sm text-texto-suave">
        Usuario
      </Label>
      <Input
        id="campo-username"
        name="username"
        type="text"
        inputMode="text"
        autoComplete="username"
        // Sin esto el teclado del celular pone mayuscula a la primera letra y el login falla
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={LONGITUD_MAXIMA_USERNAME}
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'error-username' : undefined}
        readOnly={enviando}
        className="h-11 bg-fondo-tarjeta"
        value={username}
        onChange={(evento) => onCambiarUsername(evento.target.value)}
      />
      {error && (
        <p id="error-username" className="text-sm font-medium text-peligro">
          {error}
        </p>
      )}
    </div>
  )
}
