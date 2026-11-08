import type { FormEvent } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BotonIngresar } from '@/features/auth/components/boton-ingresar'
import { CampoClave } from '@/features/auth/components/campo-clave'
import { CampoUsuario } from '@/features/auth/components/campo-usuario'
import type { IniciarSesionProps } from '@/features/auth/types/inicio-sesion'

export function IniciarSesion({
  credenciales,
  claveVisible,
  enviando,
  errorGeneral,
  erroresCampos,
  onCambiarUsername,
  onCambiarClave,
  onAlternarVisibilidadClave,
  onIniciarSesion,
}: IniciarSesionProps) {
  // El submit nativo cubre el Enter y el boton; la validacion la hace el hook, no el navegador
  const manejarEnvio = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    onIniciarSesion()
  }

  return (
    // Pantalla independiente, sin menu de modulos. min-h-dvh (no h-dvh) deja hacer scroll con el teclado abierto
    <main className="flex min-h-dvh items-center justify-center bg-fondo-pagina px-4 py-8">
      <Card className="w-full max-w-sm sm:py-8">
        {/* --- MARCA Y TITULO --- */}
        <CardHeader className="items-center justify-items-center text-center sm:px-8">
          {/* Solo texto: el logotipo con su propio icono se incorporara mas adelante */}
          <p className="text-2xl font-bold">PetFlow</p>
          {/* h1 propio: CardTitle es un div y la pantalla necesita un encabezado semantico */}
          <h1 className="mt-2 text-xl leading-none font-semibold">Iniciar sesión</h1>
        </CardHeader>

        {/* --- FORMULARIO --- */}
        <CardContent className="sm:px-8">
          <form
            noValidate
            aria-busy={enviando}
            className="flex flex-col gap-4"
            onSubmit={manejarEnvio}
          >
            <CampoUsuario
              username={credenciales.username}
              enviando={enviando}
              error={erroresCampos.username}
              onCambiarUsername={onCambiarUsername}
            />
            <CampoClave
              clave={credenciales.clave}
              claveVisible={claveVisible}
              enviando={enviando}
              error={erroresCampos.clave}
              onCambiarClave={onCambiarClave}
              onAlternarVisibilidadClave={onAlternarVisibilidadClave}
            />

            {/* Error general: 401 generico, red o servidor. Queda entre los campos y la accion */}
            {errorGeneral && (
              <Alert variant="destructive">
                <TriangleAlert aria-hidden="true" />
                <AlertDescription>{errorGeneral}</AlertDescription>
              </Alert>
            )}

            <BotonIngresar enviando={enviando} />
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
