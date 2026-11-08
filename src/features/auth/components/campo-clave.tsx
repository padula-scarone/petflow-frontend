import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** Props del campo de la contrasena, con boton para mostrarla u ocultarla. */
interface CampoClaveProps {
  clave: string
  claveVisible: boolean
  /** Mientras se envia, el campo queda de solo lectura para que lo enviado sea lo que se ve. */
  enviando: boolean
  error?: string
  onCambiarClave: (clave: string) => void
  onAlternarVisibilidadClave: () => void
}

export function CampoClave({
  clave,
  claveVisible,
  enviando,
  error,
  onCambiarClave,
  onAlternarVisibilidadClave,
}: CampoClaveProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="campo-clave" className="text-sm text-texto-suave">
        Contraseña
      </Label>
      <div className="relative">
        {/* Sin maxLength ni recorte: los espacios forman parte de la clave */}
        <Input
          id="campo-clave"
          name="clave"
          type={claveVisible ? 'text' : 'password'}
          autoComplete="current-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-required="true"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'error-clave' : undefined}
          readOnly={enviando}
          className="h-11 bg-fondo-tarjeta pr-11"
          value={clave}
          onChange={(evento) => onCambiarClave(evento.target.value)}
        />
        {/* Tactil de 44px dentro del campo; type="button" para no enviar el formulario */}
        <Button
          type="button"
          variant="ghost"
          className="absolute inset-y-0 right-0 size-11 text-texto-suave"
          aria-label={claveVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={claveVisible}
          aria-controls="campo-clave"
          onClick={onAlternarVisibilidadClave}
        >
          {claveVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
      {error && (
        <p id="error-clave" className="text-sm font-medium text-peligro">
          {error}
        </p>
      )}
    </div>
  )
}
